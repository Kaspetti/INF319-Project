package network

import (
    . "github.com/Kaspetti/INF319-Project/internal/geo"

    "sync"
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


// getAllDistances gets the distances from one line to all others.
// The result is a 2D array where each row contains the distances from
// all coordinates in line1 to another line.
func getAllDistances(line1 Line, lines []Line) [][]float64 {
    dists := make([][]float64, len(lines))
    var wg sync.WaitGroup

    for i, line2 := range lines {
        wg.Add(1)    
        go func(i int, line2 Line) {
            defer wg.Done()
            line2Dists := getDistances(line1, line2)
            dists[i] = line2Dists
        }(i, line2)
    }

    wg.Wait()
    return dists
}
