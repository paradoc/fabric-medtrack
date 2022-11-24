package handler

import (
	"net/http"

	"gateway/src/internal/logic"
	"gateway/src/internal/svc"
	"gateway/src/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func GetAssetHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.ReadRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.Error(w, err)
			return
		}

		l := logic.NewGetAssetLogic(r.Context(), svcCtx)
		resp, err := l.GetAsset(&req)
		if err != nil {
			httpx.Error(w, err)
		} else {
			httpx.OkJson(w, resp)
		}
	}
}
