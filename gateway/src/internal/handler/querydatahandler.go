package handler

import (
	"net/http"

	"gateway/src/internal/config"
	"gateway/src/internal/logic"
	"gateway/src/internal/svc"
	"gateway/src/internal/types"

	"github.com/zeromicro/go-zero/rest/httpx"
)

func QueryDataHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		config.EnableCors(w)

		var req types.QueryRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.Error(w, err)
			return
		}

		l := logic.NewQueryDataLogic(r.Context(), svcCtx)
		resp, err := l.QueryData(&req)
		if err != nil {
			httpx.Error(w, err)
		} else {
			httpx.OkJson(w, resp)
		}
	}
}
