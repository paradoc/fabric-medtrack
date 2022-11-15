package svc

import (
	"gateway/connection"
	"gateway/read/internal/config"
)

type ServiceContext struct {
	Config  config.Config
	Gateway *connection.GatewayConn
}

func NewServiceContext(c config.Config, gw *connection.GatewayConn) *ServiceContext {
	return &ServiceContext{
		Config:  c,
		Gateway: gw,
	}
}
