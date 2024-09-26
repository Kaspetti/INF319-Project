// package netcdf contains functionality for reading lines from netcdf files.
package netcdf

import (
	"errors"
	"fmt"

	. "github.com/Kaspetti/INF319-Project/internal/geo"
	"github.com/batchatco/go-native-netcdf/netcdf"
)

// GetAllLines gets all lines of a given date from all ensemble members.
// Dates range from 0-240 and is hours since simulation start.
func GetAllLines(dataFolder string, time int64, test bool) ([]Line, error) {
	allLines := make([]Line, 0)
	for i := 0; i < 50; i++ {
		lines, err := getLines(dataFolder, int64(i), time, test)
		if err != nil {
			return nil, err
		}

		allLines = append(allLines, lines...)
	}

	return allLines, nil
}

func getLines(dataFolder string, ensId int64, time int64, test bool) ([]Line, error) {
	// Opens the netCDF file of the ensamble member of id 'ensId'
    rootFolder := "."
    if test {
        rootFolder = "../.."
    }
	nc, err := netcdf.Open(fmt.Sprintf("%s/%s/ec.ens_%02d.%s.sfc.mta.nc", rootFolder, dataFolder, ensId, dataFolder))
	if err != nil {
		return nil, err
	}
	defer nc.Close()

	latVr, err := nc.GetVariable("latitude")
	if err != nil {
		return nil, err
	}
	lats, ok := latVr.Values.([]float64)
	if !ok {
		return nil, errors.New("Latitudes were not of type 'float64'")
	}

	lonVr, err := nc.GetVariable("longitude")
	if err != nil {
		return nil, err
	}
	lons, ok := lonVr.Values.([]float64)
	if !ok {
		return nil, errors.New("Longitudes were not of type 'float64'")
	}

	idVr, err := nc.GetVariable("line_id")
	if err != nil {
		return nil, err
	}
	ids, ok := idVr.Values.([]int64)
	if !ok {
		return nil, errors.New("Line ids were not of type 'int64'")
	}

	dateVr, err := nc.GetVariable("date")
	if err != nil {
		return nil, err
	}
	dates, ok := dateVr.Values.([]int64)
	if !ok {
		return nil, errors.New("Dates were not of type 'int64'")
	}

	lines := make([]Line, 0)
	for i := 0; i < len(ids); i++ {
		if dates[i] == time {
			id := ids[i]
			if int64(len(lines)) < id {
				lines = append(lines,
					Line{
						Id:     fmt.Sprintf("%d|%d", ensId, id),
						Coords: make([]CoordGeo, 0),
					},
				)
			}

			lines[id-1].Coords = append(
                lines[id-1].Coords,
                CoordGeo {
                    Latitude: lats[i],
                    Longitude: lons[i],
                },
            )
		} else if dates[i] > time {
			break
		}
	}

	return lines, nil
}
