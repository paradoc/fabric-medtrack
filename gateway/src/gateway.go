package main

import (
	"flag"
	"fmt"

	"gateway/connection"
	"gateway/src/internal/config"
	"gateway/src/internal/handler"
	"gateway/src/internal/svc"

	"github.com/zeromicro/go-zero/core/conf"
	"github.com/zeromicro/go-zero/rest"
)

var configFile = flag.String("f", "etc/gateway.yaml", "the config file")

func main() {
	flag.Parse()

	var c config.Config
	conf.MustLoad(*configFile, &c)

	server := rest.MustNewServer(c.RestConf, rest.WithCors())
	defer server.Stop()

	gw := connection.GatewayConn{}
	connection.Init(c.FabricConf, &gw)
	defer gw.Close()

	ctx := svc.NewServiceContext(c, &gw)
	handler.RegisterHandlers(server, ctx)

	fmt.Printf("Starting server at %s:%d...\n", c.Host, c.Port)
	server.Start()
}
