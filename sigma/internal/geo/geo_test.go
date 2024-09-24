package geo

import (
	"math"
	"testing"
)

func TestConvertBackForth(t *testing.T) {
	coordGeo := CoordGeo{
		Latitude:  40,
		Longitude: 75,
	}

	coord3D := coordGeo.To3D()
	coordGeo2 := coord3D.ToGeo()

	if math.Abs(coordGeo2.Latitude-coordGeo.Latitude) > 0.00001 ||
		math.Abs(coordGeo2.Longitude-coordGeo.Longitude) > 0.00001 {
		t.Fatalf("coordGeo2 = %v, want %v", coordGeo2, coordGeo)
	}
}

func TestConvertTo3D(t *testing.T) {
	coordGeo := CoordGeo{
		Latitude:  40,
		Longitude: 75,
	}

	coord3D := coordGeo.To3D()
	want := Coord3D{
		X: 0.19826689127414618,
		Y: 0.739942111693848,
		Z: 0.6427876096865393,
	}

	if math.Abs(coord3D.X-want.X) > 0.00001 ||
		math.Abs(coord3D.Y-want.Y) > 0.00001 ||
		math.Abs(coord3D.Z-want.Z) > 0.00001 {
		t.Fatalf("coord3D = %v, want %v", coord3D, want)
	}
}
