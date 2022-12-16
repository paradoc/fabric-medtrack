package logic

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"gateway/src/internal/svc"
	"gateway/src/internal/types"

	"github.com/hyperledger/fabric-gateway/pkg/client"
	"github.com/senseyeio/duration"
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

const layout = "2006-01-02 15:04:05"

func (l *QueryDataLogic) QueryCompliance(req *types.QueryRequest) (resp *types.QueryComplianceResponse, err error) {
	assetData, err := queryAssets(l.svcCtx.Gateway.Contract, req.Generic, req.Start, req.End)
	if len(assetData) == 0 {
		return &types.QueryComplianceResponse{
			Current:         0,
			Expected:        0,
			Generic:         req.Generic,
			TotalDispatches: 0,
		}, nil
	}

	var queriedAssets []types.ReadResponse
	err = json.Unmarshal(assetData, &queriedAssets)
	if err != nil {
		panic(fmt.Errorf("failed to marshal asset data: %w", err.Error()))
	}

	var expectedFinished int = 0
	var currentlyFinished int = 0
	now := time.Now()

	for _, queriedAsset := range queriedAssets {
		for _, medication := range queriedAsset.Medications {
			d, _ := duration.ParseISO8601(medication.Frequency)
			dispatchDate, _ := time.Parse(layout, queriedAsset.DispatchDate)
			expectedFinishedOn := d.Shift(dispatchDate)
			for k := 0; k < medication.EndAfterN-1; k++ {
				expectedFinishedOn = d.Shift(expectedFinishedOn)
			}
			if queriedAsset.History.EndedAt != "" {
				currentlyFinished = currentlyFinished + 1
				expectedFinished = expectedFinished + 1
			} else if now.After(expectedFinishedOn) {
				expectedFinished = expectedFinished + 1
			}
		}
	}

	return &types.QueryComplianceResponse{
		Current:         currentlyFinished,
		Expected:        expectedFinished,
		Generic:         req.Generic,
		TotalDispatches: len(queriedAssets),
	}, nil
}

func (l *QueryDataLogic) QueryData(req *types.QueryRequest) (resp *[]types.QueryResponse, err error) {
	assetData, err := queryAssets(l.svcCtx.Gateway.Contract, req.Generic, req.Start, req.End)
	if len(assetData) == 0 {
		return &[]types.QueryResponse{}, nil
	}
	err = json.Unmarshal(assetData, &resp)
	if err != nil {
		panic(fmt.Errorf("failed to marshal asset data: %w", err.Error()))
	}
	return resp, err
}

func queryAssets(contract *client.Contract, generic string, start string, end string) ([]byte, error) {
	fmt.Println("Evaluate Transaction: QueryAssets, function returns all the current assets on the ledger given a query")
	evaluateResult, err := contract.EvaluateTransaction("QueryAssets", generic, start, end)
	if err != nil {
		panic(fmt.Errorf("failed to evaluate transaction: %w", err))
	}
	return evaluateResult, nil
}
