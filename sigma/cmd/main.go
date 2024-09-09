package main

import (
	"log"

	"github.com/Kaspetti/INF319-Project/internal/server"
)

func main() {
	if err := server.StartServer(); err != nil {
		log.Fatalln(err)
	}
}

