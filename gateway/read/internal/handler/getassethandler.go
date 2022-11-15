package handler

import (
	"net/http"

	"gateway/read/internal/logic"
	"gateway/read/internal/svc"
	"gateway/read/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func GetAssetHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.Request
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
