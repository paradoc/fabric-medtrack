package config

import (
	"gateway/connection"
	"net/http"

	"github.com/zeromicro/go-zero/rest"
)

type Config struct {
	rest.RestConf
	connection.FabricConf
}

func EnableCors(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Headers", "*")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
}
