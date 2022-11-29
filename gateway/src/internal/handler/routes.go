// Code generated by goctl. DO NOT EDIT.
package handler

import (
	"net/http"

	"gateway/src/internal/svc"

	"github.com/zeromicro/go-zero/rest"
)

func RegisterHandlers(server *rest.Server, serverCtx *svc.ServiceContext) {
	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodPost,
				Path:    "/dispatch",
				Handler: DispatchAssetHandler(serverCtx),
			},
		},
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/query",
				Handler: QueryDataHandler(serverCtx),
			},
		},
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/read",
				Handler: GetAssetHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/read/:id",
				Handler: GetAssetHandler(serverCtx),
			},
		},
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodPut,
				Path:    "/update",
				Handler: UpdateAssetHandler(serverCtx),
			},
		},
	)
}
