from typing import Literal
from concurrent.futures import ProcessPoolExecutor
from functools import partial

from coords import Coord3D, CoordGeo

import numpy as np
import xarray as xr


class Line:
    """A line.

    A line is a collection of ordered points.

    Attributes:
        id (str): The unique identifier of the line.
            The id is created by combining the ensemble number
            the line is part of and the line's id in that ensemble.
            'ensemble_nr|line_id'
        coords (List[CoordGeo]): A list of the coordinates of the line.
    """

    id: str
    coords: list[CoordGeo]
    centroid: CoordGeo

    def __init__(self, id: str, coords: list[CoordGeo], centroid: CoordGeo) -> None:
        self.id = id
        self.coords = coords
        self.centroid = centroid

    def to_dict(self):
        return {
            "id": self.id,
            "coords": [{"lon": coord.lon, "lat": coord.lat} for coord in self.coords],
            "centroid": {"lon": self.centroid.lon, "lat": self.centroid.lat}
        }


def get_all_lines_at_time(
    start: str, time_offset: int, line_type: Literal["mta", "jet"]
) -> list[Line]:
    """Reads all lines from a NETCDF4 file and returns them.

    Reads a group of NETCDF4 files of a specific format and returns the lines
    in the files which has the specified time offset.
    The file names must be of the following format:
        ec.ens_{ens_id}.{start}.{sfc|pv2000}.{mta|jetaxis}.nc
    where ens_id is between 00 and 50.
    The files must be in the following path:
        ./data/{mta|jet}/{start}
    The file needs to have the following attributes:
        longitude
        latitude
        date
    where date is the time offset in hours from the start time.
    The function expects 50 files, or 50 ensembles, to be present
    in the folder './date/{mta|jet}/{start}'

    :param start: The start time of the computation.
        Must be of the format: YYYYMMDDTT where TT is one of
        00 or 12.
    :param time_offset: The time offset from the start to get the lines.
        The offset is given in hours from the start time.
    :param line_type: The type of the lines to get.
        Currently supported line types are 'mta' and 'jet'.
    :return: A list of the lines from the 50 ensembles at the time offset.
    """
    all_lines = []

    start_time = np.datetime64(
        f"{start[0:4]}-{start[4:6]}-{start[6:8]}T{start[8:10]}:00:00"
    )

    for i in range(50):
        base_path = f"./data/{line_type}/{start}/"
        file_path = f"ec.ens_{i:02d}.{start}.sfc.mta.nc"

        if line_type == "jet":
            file_path = f"ec.ens_{i:02d}.{start}.pv2000.jetaxis.nc"
        full_path = base_path + file_path

        ds = xr.open_dataset(full_path)
        date_ds = ds.where(
            ds.date == start_time + np.timedelta64(time_offset, "h"), drop=True
        )

        grouped_ds = list(date_ds.groupby("line_id"))

        for id_, line in grouped_ds:
            coords = [
                CoordGeo(lon, lat)
                for lon, lat in zip(line.longitude.values, line.latitude.values)
            ]

            if max(line.longitude.values) - min(line.longitude.values) > 180:
                coords = dateline_fix(coords)

            centroid = Coord3D(0, 0, 0)
            for coord in coords:
                coord_3D = coord.to_3D()
                centroid += coord_3D

            centroid_geo = (centroid * (1/len(coords))).to_lon_lat()

            all_lines.append(Line(id=f"{i}|{int(id_)}", coords=coords, centroid=centroid_geo))

    return all_lines


def get_all_lines_in_ens(
    start: str, ens_nr: int, line_type: Literal["mta", "jet"]
) -> list[Line]:
    all_lines = []

    start_time = np.datetime64(
        f"{start[0:4]}-{start[4:6]}-{start[6:8]}T{start[8:10]}:00:00"
    )

    base_path = f"./data/{line_type}/{start}/"
    file_path = f"ec.ens_{ens_nr:02d}.{start}.sfc.mta.nc"

    if line_type == "jet":
        file_path = f"ec.ens_{ens_nr:02d}.{start}.pv2000.jetaxis.nc"
    full_path = base_path + file_path

    ds = xr.open_dataset(full_path)
    ds = ds.assign_coords(
        date_line=xr.DataArray(
            [f"{d}_{l}" for d, l in zip(ds.date.values, ds.line_id.values)],
            dims=ds.date.dims  # or whichever dimension these variables share
        )
    )
    grouped_ds = list(ds.groupby("date_line"))

    for id_, line in grouped_ds:
        coords = [
            CoordGeo(lon, lat)            
            for lon, lat in zip(line.longitude.values, line.latitude.values)
        ]
        hour_offset = (line.date.values[0] - start_time) // np.timedelta64(1, "h")
        if max(line.longitude.values) - min(line.longitude.values) > 180:
            coords = dateline_fix(coords)

        centroid = Coord3D(0, 0, 0)
        for coord in coords:
            coord_3D = coord.to_3D()
            centroid += coord_3D

        centroid_geo = (centroid * (1/len(coords))).to_lon_lat()

        all_lines.append(Line(id=f"{hour_offset}|{line.line_id.values[0]}", coords=coords, centroid=centroid_geo))

    return all_lines


def process_single_file(ens_id: int, start: str, line_type: Literal["mta", "jet"]):
    times = [t for t in range(0, 73, 3)] + [t for t in range(78, 241, 6)]
    lines_at_time = {t: [] for t in times}

    start_time = np.datetime64(
        f"{start[0:4]}-{start[4:6]}-{start[6:8]}T{start[8:10]}:00:00"
    )

    base_path = f"./data/{line_type}/{start}/"
    file_path = f"ec.ens_{ens_id:02d}.{start}.sfc.mta.nc"

    if line_type == "jet":
        file_path = f"ec.ens_{ens_id:02d}.{start}.pv2000.jetaxis.nc"
    full_path = base_path + file_path

    with xr.open_dataset(full_path) as ds:
        lines = list(ds.groupby(["line_id", "date"]))
        for _, line in lines:
            t = int((line.date.values[0] - start_time) / np.timedelta64(1, "h"))
            coords = [
                CoordGeo(lon, lat)
                for lon, lat in zip(line.longitude.values, line.latitude.values)
            ]

            if max(line.longitude.values) - min(line.longitude.values) > 180:
                coords = dateline_fix(coords)

            centroid = Coord3D(0, 0, 0)
            for coord in coords:
                coord_3D = coord.to_3D()
                centroid += coord_3D

            centroid_geo = (centroid * (1/len(coords))).to_lon_lat()
            lines_at_time[t].append(Line(id=f"{ens_id}|{line.line_id.values[0]}", coords=coords, centroid=centroid_geo))

    return lines_at_time


def get_all_lines(start: str, line_type: Literal["mta", "jet"]) -> dict[int, list[Line]]:
    with ProcessPoolExecutor(max_workers=8) as executor:
        process_func = partial(
            process_single_file,
            start=start,
            line_type=line_type,
        )
        process_dicts = list(executor.map(process_func, range(50)))

    lines_at_time = process_dicts[0]
    for process_dict in process_dicts[1:]:
        for t in lines_at_time.keys():
            lines_at_time[t] += process_dict[t]

    return lines_at_time



def dateline_fix(coords: list[CoordGeo]) -> list[CoordGeo]:
    """Shifts a list of coordinates by 360 degrees longitude.

    :param coords: The list of coordinates to shift.
    :return: The original coordinates shifted by 360 degrees longitude.
    """
    for i, coord in enumerate(coords):
        if coord.lon < 0:
            coords[i] = CoordGeo(coord.lon + 360, coord.lat)

    return coords


if __name__ == "__main__":
    # print(get_all_lines("2024101900", "jet"))
    # print(process_single_file("2024101900", "jet", 0)[0])
    print(len(get_all_lines("2024101900", "jet")[0]))
