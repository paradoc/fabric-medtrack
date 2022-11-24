package config

import (
	"gateway/connection"

	"github.com/zeromicro/go-zero/rest"
)

type Config struct {
	rest.RestConf
	connection.FabricConf
}
