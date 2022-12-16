package logic

import (
	"context"
	"encoding/json"
	"fmt"

	"gateway/src/internal/svc"
	"gateway/src/internal/types"

	"github.com/google/uuid"
	"github.com/hyperledger/fabric-gateway/pkg/client"
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
	uuidObj, _ := uuid.NewUUID()
	dispatchId := uuidObj.String()
	createAsset(l.svcCtx.Gateway.Contract, req.Medications, dispatchId, req.DispatchDate)
	return &types.DispatchResponse{DispatchId: dispatchId}, nil
}

// Create a single asset.
func createAsset(contract *client.Contract, medications []types.Medication, dispatchId string, dispatchDate string) error {
	fmt.Println("Submit Transaction: [CreateAsset]")
	asset := types.Asset{
		ReadResponse: types.ReadResponse{
			DispatchDate: dispatchDate,
			DispatchId:   dispatchId,
			Medications:  medications,
			History: types.History{
				Timestamps: []string{},
			},
		},
	}
	args, _ := json.Marshal(asset)
	_, err := contract.SubmitTransaction("CreateAsset", string(args))
	if err != nil {
		panic(fmt.Errorf("failed to submit transaction: %w", err))
	}
	return err
}
