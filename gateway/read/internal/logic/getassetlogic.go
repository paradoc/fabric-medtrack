package logic

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"

	"gateway/read/internal/svc"
	"gateway/read/internal/types"

	"github.com/hyperledger/fabric-gateway/pkg/client"
	"github.com/zeromicro/go-zero/core/logx"
)

type GetAssetLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetAssetLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetAssetLogic {
	return &GetAssetLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetAssetLogic) GetAsset(req *types.Request) (resp *[]types.Response, err error) {
	assets := getAllAssets(l.svcCtx.Gateway.Contract)
	err = json.Unmarshal(assets, &resp)
	if err != nil {
		panic(fmt.Errorf("failed to marshal assets: %w", err))
	}
	return resp, err
}

// Evaluate a transaction to query ledger state.
func getAllAssets(contract *client.Contract) []byte {
	fmt.Println("Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger")

	evaluateResult, err := contract.EvaluateTransaction("GetAllAssets")
	if err != nil {
		panic(fmt.Errorf("failed to evaluate transaction: %w", err))
	}
	return evaluateResult
}

// Format JSON data
func formatJSON(data []byte) string {
	var prettyJSON bytes.Buffer
	if err := json.Indent(&prettyJSON, data, " ", ""); err != nil {
		panic(fmt.Errorf("failed to parse JSON: %w", err))
	}
	return prettyJSON.String()
}
