package chaincode_test

import (
	"encoding/json"
	"fmt"
	"testing"

	"cc/chaincode"
	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/hyperledger/fabric-protos-go/ledger/queryresult"
	"github.com/hyperledger/fabric-samples/asset-transfer-basic/chaincode-go/chaincode/mocks"
	"github.com/stretchr/testify/require"
)

//go:generate counterfeiter -o mocks/transaction.go -fake-name TransactionContext . transactionContext
type transactionContext interface {
	contractapi.TransactionContextInterface
}

//go:generate counterfeiter -o mocks/chaincodestub.go -fake-name ChaincodeStub . chaincodeStub
type chaincodeStub interface {
	shim.ChaincodeStubInterface
}

//go:generate counterfeiter -o mocks/statequeryiterator.go -fake-name StateQueryIterator . stateQueryIterator
type stateQueryIterator interface {
	shim.StateQueryIteratorInterface
}

func TestInitLedger(t *testing.T) {
	chaincodeStub := &mocks.ChaincodeStub{}
	transactionContext := &mocks.TransactionContext{}
	transactionContext.GetStubReturns(chaincodeStub)

	assetTransfer := chaincode.SmartContract{}
	err := assetTransfer.InitLedger(transactionContext)
	require.NoError(t, err)

	chaincodeStub.PutStateReturns(fmt.Errorf("failed inserting key"))
	err = assetTransfer.InitLedger(transactionContext)
	require.EqualError(t, err, "failed to put to world state. failed inserting key")
}

func TestCreateAsset(t *testing.T) {
	chaincodeStub := &mocks.ChaincodeStub{}
	transactionContext := &mocks.TransactionContext{}
	transactionContext.GetStubReturns(chaincodeStub)
	newAsset := chaincode.Asset{
		DispatchDate: "today",
		DispatchId:   "test-dispatch-id",
		Medications: []chaincode.Medication{
			{
				BrandName:   "test-brand",
				GenericName: "test-generic",
				Frequency:   "test-frequency",
				EndAfterN:   1,
			},
		},
		History: chaincode.History{
			StartedAt:  "",
			EndedAt:    "",
			Timestamps: []string{},
		},
	}

	assetTransfer := chaincode.SmartContract{}
	err := assetTransfer.CreateAsset(transactionContext, newAsset)
	require.NoError(t, err)

	chaincodeStub.GetStateReturns([]byte{}, nil)
	err = assetTransfer.CreateAsset(transactionContext, newAsset)
	require.EqualError(t, err, "the asset test-dispatch-id already exists")

	chaincodeStub.GetStateReturns(nil, fmt.Errorf("unable to retrieve asset"))
	err = assetTransfer.CreateAsset(transactionContext, newAsset)
	require.EqualError(t, err, "failed to read from world state: unable to retrieve asset")
}

func TestReadAsset(t *testing.T) {
	chaincodeStub := &mocks.ChaincodeStub{}
	transactionContext := &mocks.TransactionContext{}
	transactionContext.GetStubReturns(chaincodeStub)

	expectedAsset := &chaincode.Asset{DispatchId: "test-dispatch-id"}
	bytes, err := json.Marshal(expectedAsset)
	require.NoError(t, err)

	chaincodeStub.GetStateReturns(bytes, nil)
	assetTransfer := chaincode.SmartContract{}
	asset, err := assetTransfer.ReadAsset(transactionContext, "")
	require.NoError(t, err)
	require.Equal(t, expectedAsset, asset)

	chaincodeStub.GetStateReturns(nil, fmt.Errorf("unable to retrieve asset"))
	_, err = assetTransfer.ReadAsset(transactionContext, "")
	require.EqualError(t, err, "failed to read from world state: unable to retrieve asset")

	chaincodeStub.GetStateReturns(nil, nil)
	asset, err = assetTransfer.ReadAsset(transactionContext, "test-dispatch-id")
	require.EqualError(t, err, "asset not found")
	require.Nil(t, asset)
}

func TestAddHistory(t *testing.T) {
	chaincodeStub := &mocks.ChaincodeStub{}
	transactionContext := &mocks.TransactionContext{}
	transactionContext.GetStubReturns(chaincodeStub)

	expectedAsset := &chaincode.Asset{
		DispatchDate: "today",
		DispatchId:   "test-dispatch-id",
		Medications: []chaincode.Medication{
			{
				BrandName:   "test-brand",
				GenericName: "test-generic",
				Frequency:   "test-frequency",
				EndAfterN:   1,
			},
		},
		History: chaincode.History{
			StartedAt:  "",
			EndedAt:    "",
			Timestamps: []string{},
		},
	}
	bytes, err := json.Marshal(expectedAsset)
	require.NoError(t, err)

	chaincodeStub.GetStateReturns(bytes, nil)
	assetTransfer := chaincode.SmartContract{}

	err = assetTransfer.AddHistory(transactionContext, "test-dispatch-id", []string{"today", "tomorrow"})
	require.NoError(t, err)

	chaincodeStub.GetStateReturns(nil, nil)
	err = assetTransfer.AddHistory(transactionContext, "test-dispatch-id", []string{"today", "tomorrow"})
	require.EqualError(t, err, "the asset test-dispatch-id does not exist")

	chaincodeStub.GetStateReturns(nil, fmt.Errorf("unable to retrieve asset"))
	err = assetTransfer.AddHistory(transactionContext, "test-dispatch-id", []string{"today", "tomorrow"})
	require.EqualError(t, err, "failed to read from world state: unable to retrieve asset")
}

func TestGetAllAssets(t *testing.T) {
	asset := &chaincode.Asset{DispatchId: "test-dispatch-id"}
	bytes, err := json.Marshal(asset)
	require.NoError(t, err)

	iterator := &mocks.StateQueryIterator{}
	iterator.HasNextReturnsOnCall(0, true)
	iterator.HasNextReturnsOnCall(1, false)
	iterator.NextReturns(&queryresult.KV{Value: bytes}, nil)

	chaincodeStub := &mocks.ChaincodeStub{}
	transactionContext := &mocks.TransactionContext{}
	transactionContext.GetStubReturns(chaincodeStub)

	chaincodeStub.GetStateByRangeReturns(iterator, nil)
	assetTransfer := &chaincode.SmartContract{}
	assets, err := assetTransfer.GetAllAssets(transactionContext, 1)
	require.NoError(t, err)
	require.Equal(t, []*chaincode.Asset{asset}, assets)

	iterator.HasNextReturns(true)
	iterator.NextReturns(nil, fmt.Errorf("failed retrieving next item"))
	assets, err = assetTransfer.GetAllAssets(transactionContext, 0)
	require.EqualError(t, err, "failed retrieving next item")
	require.Nil(t, assets)

	chaincodeStub.GetStateByRangeReturns(nil, fmt.Errorf("failed retrieving all assets"))
	assets, err = assetTransfer.GetAllAssets(transactionContext, 0)
	require.EqualError(t, err, "failed retrieving all assets")
	require.Nil(t, assets)
}

func TestGetNAssets(t *testing.T) {
	asset := &chaincode.Asset{DispatchId: "test-dispatch-id"}
	bytes, err := json.Marshal(asset)
	require.NoError(t, err)

	iterator := &mocks.StateQueryIterator{}
	iterator.HasNextReturnsOnCall(0, true)
	iterator.HasNextReturnsOnCall(1, false)
	iterator.NextReturns(&queryresult.KV{Value: bytes}, nil)

	chaincodeStub := &mocks.ChaincodeStub{}
	transactionContext := &mocks.TransactionContext{}
	transactionContext.GetStubReturns(chaincodeStub)

	chaincodeStub.GetStateByRangeReturns(iterator, nil)
	assetTransfer := &chaincode.SmartContract{}
	assets, err := assetTransfer.GetAllAssets(transactionContext, 1)
	require.NoError(t, err)
	require.Equal(t, []*chaincode.Asset{asset}, assets)

	iterator.HasNextReturns(true)
	iterator.NextReturns(nil, fmt.Errorf("failed retrieving next item"))
	assets, err = assetTransfer.GetAllAssets(transactionContext, 1)
	require.EqualError(t, err, "failed retrieving next item")
	require.Nil(t, assets)

	chaincodeStub.GetStateByRangeReturns(nil, fmt.Errorf("failed retrieving all assets"))
	assets, err = assetTransfer.GetAllAssets(transactionContext, 1)
	require.EqualError(t, err, "failed retrieving all assets")
	require.Nil(t, assets)
}
