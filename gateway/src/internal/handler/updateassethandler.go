package handler

import (
	"net/http"

	"gateway/src/internal/logic"
	"gateway/src/internal/svc"
	"gateway/src/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func UpdateAssetHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.UpdateRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.Error(w, err)
			return
		}

		l := logic.NewUpdateAssetLogic(r.Context(), svcCtx)
		err := l.UpdateAsset(&req)
		if err != nil {
			httpx.Error(w, err)
		} else {
			httpx.Ok(w)
		}
	}
}
