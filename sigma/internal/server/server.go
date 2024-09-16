// package server contains all functions for fetching data from the server.
// This includes web pages and also the api itself.
package server

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/Kaspetti/INF319-Project/internal/netcdf"
	"github.com/gin-gonic/gin"
)

// StartServer sets up the endpoints and starts the server
func StartServer() error {
	r := gin.Default()

	r.GET("/get-coords", getAllLines)

	return r.Run(":8000")
}

// getAllLines calls the GetAllLines function from the netcdf internal package.
// It passes the date gotten from the 'date' query parameter and returns all lines
// from the 50 ensemble members.
func getAllLines(ctx *gin.Context) {
	var simStart string
    var timeOffset int64

    if simStartQuery, ok := ctx.GetQuery("sim-start"); !ok {
        ctx.JSON(http.StatusBadRequest, gin.H{
            "message": "sim-start parameter missing",
        })
        return
    } else {
        simStart = simStartQuery
    }

	if timOffseteQuery, ok := ctx.GetQuery("time-offset"); !ok {
		timeOffset = 0
	} else {
		var err error
		timeOffset, err = strconv.ParseInt(timOffseteQuery, 10, 64)
		if err != nil {
			timeOffset = 0
		}
	}

	lines, err := netcdf.GetAllLines(simStart, timeOffset)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
            "message": fmt.Sprintf("error getting lines for date %s", simStart),
            "error": err.Error(),
        })
		return
	}

	ctx.JSON(http.StatusOK, lines)
}
