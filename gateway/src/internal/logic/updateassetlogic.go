package logic

import (
	"context"
	"fmt"

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
	fmt.Println("Submit Transaction: [AddHistory]")
	_, err := l.svcCtx.Gateway.Contract.SubmitTransaction("AddHistory", req.DispatchId)
	if err != nil {
		panic(fmt.Errorf("failed to submit transaction: %w", err))
	}
	return nil
}
