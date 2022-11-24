package logic

import (
	"context"

	"gateway/src/internal/svc"
	"gateway/src/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type DispatchAssetLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewDispatchAssetLogic(ctx context.Context, svcCtx *svc.ServiceContext) *DispatchAssetLogic {
	return &DispatchAssetLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *DispatchAssetLogic) DispatchAsset(req *types.DispatchRequest) (resp *types.DispatchResponse, err error) {
	// todo: add your logic here and delete this line

	return
}
