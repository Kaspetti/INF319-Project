package network

import (
	"math"
	"testing"

	. "github.com/Kaspetti/INF319-Project/internal/geo"
	"github.com/Kaspetti/INF319-Project/internal/netcdf"
)


func TestDistancesSameLine(t *testing.T) {
    line := Line{
        Id: "0|1",
        Coords: []CoordGeo{
            {Latitude: 0, Longitude: 0},
            {Latitude: 1, Longitude: 1},
            {Latitude: 2, Longitude: 2},
            {Latitude: 3, Longitude: 3},
        },
    }

    expected := []float64{0, 0, 0, 0}
    dist := getDistances(line, line)
    if !arrayApproxEquals(expected, dist, 0.00001) {
        t.Fatalf("\ngot: %v\nexpected: %v", dist, expected)
    }
    t.Logf("\ngot: %v\nexpected: %v", dist, expected)
}


func TestDistancesTwoLines(t *testing.T) {
    lines := []Line{
        {
            Id: "0|1",
            Coords: []CoordGeo{
                {Latitude: 0, Longitude: 0},
                {Latitude: 1, Longitude: 1},
                {Latitude: 2, Longitude: 2},
                {Latitude: 3, Longitude: 3},
            },
        },
        {
            Id: "1|2",
            Coords: []CoordGeo{
                {Latitude: 4, Longitude: 4},
                {Latitude: 5, Longitude: 5},
                {Latitude: 6, Longitude: 6},
                {Latitude: 7, Longitude: 7},
                {Latitude: 8, Longitude: 8},
            },
        },
    }

    expected := []float64{
        0.09865055123226471,
        0.07399167367144745,
        0.04932528477939284,
        0.02465889130640517,
    }
    dist := getDistances(lines[0], lines[1])

    if !arrayApproxEquals(expected, dist, 0.00001) {
        t.Fatalf("\ngot: %v\nexpected: %v", dist, expected)
    }
    t.Logf("\ngot: %v\nexpected: %v", dist, expected)
}

func BenchmarkDistancesTwoLines(b *testing.B) {
    lines, err := netcdf.GetAllLines("2024082712", 0, true)
    if err != nil {
        b.Fatalf("Error occurred when reading lines for benchmark: %v", err) 
    }

    for i := 0; i < b.N; i++ {
        b.StopTimer()
        b.StartTimer()
        getDistances(lines[0], lines[1])
    }
}


func BenchmarkDistancesAllLines(b *testing.B) {
    lines, err := netcdf.GetAllLines("2024082712", 0, true)
    if err != nil {
        b.Fatalf("Error occurred when reading lines for benchmark: %v", err) 
    }

    for i := 0; i < b.N; i++ {
        b.StopTimer()
        b.StartTimer()
        for _, line := range lines {
            getAllDistances(line, lines)
        }
    }
}


func arrayApproxEquals(a1, a2 []float64, threshold float64) bool {
    if len(a1) != len(a2) {
        return false
    }

    for i := range a1 {
        if math.Abs(a1[i] - a2[i]) > threshold {
            return false
        }
    }

    return true
}
