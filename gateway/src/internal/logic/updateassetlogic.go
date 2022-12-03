package logic

import (
	"context"
	"encoding/json"
	"fmt"

	"gateway/src/internal/svc"
	"gateway/src/internal/types"

	"github.com/hyperledger/fabric-gateway/pkg/client"
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

func (l *UpdateAssetLogic) UpdateAsset(req *types.UpdateRequest) (resp *types.UpdateResponse, err error) {
	fmt.Println("Submit Transaction: [AddHistory]")
	ts, err := json.Marshal(req.Timestamps)
	if err != nil {
		panic(err)
	}

	proposal, err := l.svcCtx.Gateway.Contract.NewProposal("AddHistory", client.WithArguments(req.DispatchId, string(ts)))
	if err != nil {
		panic(err)
	}

	transaction, err := proposal.Endorse()
	if err != nil {
		panic(err)
	}

	commit, err := transaction.Submit()
	if err != nil {
		panic(err)
	}

	status, err := commit.Status()
	if err != nil {
		panic(err)
	}

	resp = &types.UpdateResponse{
		Status: status.Code.String(),
	}

	return resp, err
}
