package logic

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	"gateway/src/internal/svc"
	"gateway/src/internal/types"

	"github.com/hyperledger/fabric-gateway/pkg/client"
	"github.com/zeromicro/go-zero/core/logx"
	"google.golang.org/grpc/status"
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

func (l *GetAssetLogic) GetAsset(req *types.ReadRequest) (resp *[]types.ReadResponse, err error) {
	if req.Id == "" {
		return l.GetAllAssets(req)
	}
	assetData := getAsset(l.svcCtx.Gateway.Contract, req.Id)
	var responseData types.ReadResponse
	if err = json.Unmarshal(assetData, &responseData); err != nil {
		return &[]types.ReadResponse{}, nil
	}
	resp = &[]types.ReadResponse{responseData}
	return resp, err
}

func (l *GetAssetLogic) GetAllAssets(req *types.ReadRequest) (resp *[]types.ReadResponse, err error) {
	assetData := getAllAssets(l.svcCtx.Gateway.Contract, 0)
	err = json.Unmarshal(assetData, resp)
	if err != nil {
		panic(fmt.Errorf("failed to marshal asset data: %w", err.Error()))
	}
	return resp, err
}

func (l *GetAssetLogic) GetNewAssets(req *types.ReadRequest) (resp *[]types.ReadResponse, err error) {
	assetData := getAllAssets(l.svcCtx.Gateway.Contract, req.Limit)
	err = json.Unmarshal(assetData, &resp)
	if err != nil {
		panic(fmt.Errorf("failed to marshal asset data: %w", err.Error()))
	}
	return resp, err
}

// Get all assets from the ledger.
func getAllAssets(contract *client.Contract, limit int) []byte {
	fmt.Println("Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger")

	evaluateResult, err := contract.EvaluateTransaction("GetAllAssets", strconv.Itoa(limit))
	if err != nil {
		panic(fmt.Errorf("failed to evaluate transaction: %w", err))
	}
	return evaluateResult
}

// Get a single asset from the ledger.
func getAsset(contract *client.Contract, id string) []byte {
	fmt.Println("Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger")

	evaluateResult, err := contract.EvaluateTransaction("ReadAsset", id)
	if err != nil {
		if strings.Contains(status.Convert(err).Message(), "asset not found") {
			return []byte("")
		}
		panic(fmt.Errorf("failed to evaluate transaction: %w", err))
	}
	return evaluateResult
}
