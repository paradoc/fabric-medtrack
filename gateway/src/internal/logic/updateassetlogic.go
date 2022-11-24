package logic

import (
	"context"

	"gateway/src/internal/svc"
	"gateway/src/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateAssetLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdateAssetLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateAssetLogic {
	return &UpdateAssetLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UpdateAssetLogic) UpdateAsset(req *types.UpdateRequest) error {
	// todo: add your logic here and delete this line

	return nil
}
