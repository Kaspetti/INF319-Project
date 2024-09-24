package network

import (
    . "github.com/Kaspetti/INF319-Project/internal/geo"
)


// getDistances gets the distances of the points between two lines. The distances
// are calculated for each point in line1 calculate to the closest point in line2.
func getDistances(line1, line2 Line) []float64 {
    if line1.Id == line2.Id {
        return make([]float64, len(line1.Coords))
    }

    dists := make([]float64, 0)
    for _, coord1 := range line1.Coords {
        minDist := 1.0
        for _, coord2 := range line2.Coords {
            dist := coord1.To3D().Distance(coord2.To3D())
            minDist = min(minDist, dist)
        }

        dists = append(dists, minDist)
    }

    return dists
}
