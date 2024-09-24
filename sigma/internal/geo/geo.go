package geo


import (
    "math"
)


type Line struct {
	Id     string   `json:"id"`
	Coords []CoordGeo `json:"coords"`
}

type CoordGeo struct {
	Latitude  float64 `json:"lat"`
	Longitude float64 `json:"lon"`
}

type Coord3D struct {
    X float64
    Y float64
    Z float64
}


func (l Line) GetLatitudes() []float64 {
	lats := make([]float64, len(l.Coords))

	for i, c := range l.Coords {
		lats[i] = c.Latitude
	}

	return lats
}

func (l Line) GetLongitudes() []float64 {
	lons := make([]float64, len(l.Coords))

	for i, c := range l.Coords {
		lons[i] = c.Longitude
	}

	return lons
}

func (c CoordGeo) To3D() Coord3D {
    latRad := c.Latitude * (math.Pi / 180)
    lonRad := c.Longitude * (math.Pi / 180)

    return Coord3D {
        X: math.Cos(latRad) * math.Cos(lonRad),
        Y: math.Cos(latRad) * math.Sin(lonRad),
        Z: math.Sin(latRad),
    }
}

func (c Coord3D) ToGeo() CoordGeo {
    return CoordGeo {
        Latitude: math.Atan2(c.Z, math.Sqrt(c.X*c.X + c.Y*c.Y)) * 180 / math.Pi,
        Longitude: math.Atan2(c.Y, c.X) * 180 / math.Pi,
    }
}

func (c1 Coord3D) Distance(c2 Coord3D) float64 {
    return math.Sqrt(math.Pow(c1.X - c2.X, 2) + math.Pow(c1.Y - c2.Y, 2) + math.Pow(c1.Z - c2.Z, 2))
}
