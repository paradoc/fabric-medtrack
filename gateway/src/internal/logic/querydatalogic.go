package logic

import (
	"context"

	"gateway/src/internal/svc"
	"gateway/src/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type QueryDataLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewQueryDataLogic(ctx context.Context, svcCtx *svc.ServiceContext) *QueryDataLogic {
	return &QueryDataLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *QueryDataLogic) QueryData(req *types.QueryRequest) (resp *types.QueryResponse, err error) {
	// todo: add your logic here and delete this line

	return
}
