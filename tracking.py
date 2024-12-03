import xarray as xr
import numpy as np

from coords import Coord3D, CoordGeo
from line_reader import Line, dateline_fix


if __name__ == "__main__":
    ds = xr.open_dataset("./data/mta/2024101900/ec.ens_00.2024101900.sfc.mta.nc")
    start_time = np.datetime64(
        f"2024-10-19T00:00:00"
    )
    date_ds = ds.where(
        ds.date == start_time + np.timedelta64(0, "h"), drop=True
    )

    grouped_ds = list(date_ds.groupby("line_id"))
    lines_old = []
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

        centroid = (centroid * (1/len(coords))).to_lon_lat()

        lines_old.append((id_, centroid))

    print(lines_old)
