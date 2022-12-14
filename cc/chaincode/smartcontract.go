package chaincode

import (
	"bytes"
	"encoding/json"
	"fmt"
	"sort"
	"strconv"
	"time"

	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing an Asset
type SmartContract struct {
	contractapi.Contract
}

type History struct {
	EndedAt    string   `json:"ended_at"`
	StartedAt  string   `json:"started_at"`
	Timestamps []string `json:"timestamps"`
}

type Medication struct {
	BrandName   string `json:"brand_name"`
	EndAfterN   int    `json:"end_after_n"`
	Frequency   string `json:"frequency"`
	GenericName string `json:"generic_name"`
}

// Asset describes basic details of what makes up a simple asset
// Insert struct field in alphabetic order => to achieve determinism across languages
// golang keeps the order when marshal to json but doesn't order automatically
type Asset struct {
	DispatchDate string       `json:"dispatch_date"`
	DispatchId   string       `json:"dispatch_id"`
	History      History      `json:"history"`
	Medications  []Medication `json:"medications"`
}

type AssetNotFoundError struct{}

func (err *AssetNotFoundError) Error() string {
	return "asset not found"
}

func allTrue(b []bool) bool {
	for _, v := range b {
		if v == false {
			return false
		}
	}
	return true
}

// InitLedger adds a base set of assets to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	assets := []Asset{
		{
			DispatchDate: "",
			DispatchId:   "genesis-dispatch",
			Medications: []Medication{
				{
					BrandName:   "",
					GenericName: "med-name-generic",
					Frequency:   "PT24H",
					EndAfterN:   0,
				},
			},
			History: History{
				StartedAt:  "",
				EndedAt:    "",
				Timestamps: []string{},
			},
		},
	}

	for _, asset := range assets {
		assetJSON, err := json.Marshal(asset)
		if err != nil {
			return err
		}

		err = ctx.GetStub().PutState(asset.DispatchId, assetJSON)
		if err != nil {
			return fmt.Errorf("failed to put to world state. %v", err)
		}
	}

	return nil
}

// CreateAsset issues a new asset to the world state with given details.
func (s *SmartContract) CreateAsset(ctx contractapi.TransactionContextInterface, asset Asset) error {
	exists, err := s.AssetExists(ctx, asset.DispatchId)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the asset %s already exists", asset.DispatchId)
	}

	assetJSON, err := json.Marshal(asset)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(asset.DispatchId, assetJSON)
}

// AssetExists returns true when asset with given ID exists in world state
func (s *SmartContract) AssetExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	assetJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return assetJSON != nil, nil
}

// ReadAsset returns the asset stored in the world state with given id.
func (s *SmartContract) ReadAsset(ctx contractapi.TransactionContextInterface, id string) (*Asset, error) {
	assetJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if assetJSON == nil {
		return nil, &AssetNotFoundError{}
	}

	var asset Asset
	err = json.Unmarshal(assetJSON, &asset)
	if err != nil {
		return nil, err
	}

	return &asset, nil
}

// GetAllAssets returns all assets found in world state
func (s *SmartContract) GetAllAssets(ctx contractapi.TransactionContextInterface, limit int) ([]*Asset, error) {
	// range query with empty string for startKey and endKey does an
	// open-ended query of all assets in the chaincode namespace.
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var assets []*Asset
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var asset Asset
		err = json.Unmarshal(queryResponse.Value, &asset)
		if err != nil {
			return nil, err
		}
		assets = append(assets, &asset)
	}

	// Sort by newest
	sort.Slice(assets, func(i, j int) bool {
		layout := "2006-01-02 15:04:05"
		a, _ := time.Parse(layout, assets[i].DispatchDate)
		b, _ := time.Parse(layout, assets[j].DispatchDate)
		return a.After(b)
	})

	if limit >= len(assets) {
		return assets, nil
	} else {
		return assets[:limit], nil
	}
}

// Example: Parameterized rich query
func (s *SmartContract) QueryAssets(ctx contractapi.TransactionContextInterface, generic string, start string, end string) ([]*Asset, error) {
	// queryString := fmt.Sprintf(`{"selector":{"medications": { "$elemMatch": {"generic_name": { "$eq": "%s" }} }}}`, generic)
	queryString := fmt.Sprintf(`
		{
			"selector": {
				"$and": [
					{ "medications": { "$elemMatch": { "generic_name": { "$eq": "%s" } } } },
					{ "dispatch_date": { "$gte": "%s" } },
					{ "dispatch_date": { "$lte": "%s" } }
				]
			}
		}`,
		generic,
		start,
		end,
	)
	return getQueryResultForQueryString(ctx, queryString)
}

// getQueryResultForQueryString executes the passed in query string.
// The result set is built and returned as a byte array containing the JSON results.
func getQueryResultForQueryString(ctx contractapi.TransactionContextInterface, queryString string) ([]*Asset, error) {
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	return constructQueryResponseFromIterator(resultsIterator)
}

// constructQueryResponseFromIterator constructs a slice of assets from the resultsIterator
func constructQueryResponseFromIterator(resultsIterator shim.StateQueryIteratorInterface) ([]*Asset, error) {
	var assets []*Asset
	for resultsIterator.HasNext() {
		queryResult, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		var asset Asset
		err = json.Unmarshal(queryResult.Value, &asset)
		if err != nil {
			return nil, err
		}
		assets = append(assets, &asset)
	}

	return assets, nil
}

// AddHistory appends timestamps into the History.Timestamps array
func (s *SmartContract) AddHistory(ctx contractapi.TransactionContextInterface, id string, timestamps []string) error {
	exists, err := s.AssetExists(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("the asset %s does not exist", id)
	}
	currentAsset, err := s.ReadAsset(ctx, id)

	if currentAsset.History.EndedAt != "" {
		return fmt.Errorf("current asset %s has ended", id)
	}

	// overwriting original asset with new asset
	asset := Asset{
		DispatchId:   id,
		DispatchDate: currentAsset.DispatchDate,
		Medications:  currentAsset.Medications,
	}

	limitTsLen := currentAsset.Medications[0].EndAfterN

	if currentAsset.History.StartedAt != "" {
		asset.History = currentAsset.History
		sanitizedTs := append(asset.History.Timestamps, timestamps...)
		if len(sanitizedTs) > limitTsLen {
			sanitizedTs = sanitizedTs[:limitTsLen]
		}
		asset.History.Timestamps = sanitizedTs
		shouldEnd := make([]bool, len(asset.Medications))
		for i, medication := range asset.Medications {
			shouldEnd[i] = medication.EndAfterN == len(asset.History.Timestamps)
		}
		if ended := allTrue(shouldEnd); ended == true {
			asset.History.EndedAt = sanitizedTs[limitTsLen-1]
		}
	} else {
		sanitizedTs := timestamps
		if len(timestamps) > limitTsLen {
			sanitizedTs = timestamps[:limitTsLen]
		}
		var ended = ""
		for _, medication := range asset.Medications {
			if medication.EndAfterN == 1 {
				ended = timestamps[0]
			}
		}

		asset.History = History{
			StartedAt:  timestamps[0],
			EndedAt:    ended,
			Timestamps: sanitizedTs,
		}
	}

	assetJSON, err := json.Marshal(asset)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, assetJSON)
}

// GetTxHistoryForDispatchId returns the whole transaction history of a dispatch id since its creation
func (s *SmartContract) GetTxHistoryForDispatchId(ctx contractapi.TransactionContextInterface, id string) (string, error) {

	resultsIterator, err := ctx.GetStub().GetHistoryForKey(id)
	if err != nil {
		return "iterator instantiate error", err
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing historic values for the dispatch id
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return "iterator next error", err
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"TxId\":")
		buffer.WriteString("\"")
		buffer.WriteString(response.TxId)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Value\":")
		// if it was a delete operation on given key, then we need to set the
		//corresponding value null. Else, we will write the response.Value
		//as-is (as the Value itself a JSON)
		if response.IsDelete {
			buffer.WriteString("null")
		} else {
			buffer.WriteString(string(response.Value))
		}

		buffer.WriteString(", \"Timestamp\":")
		buffer.WriteString("\"")
		buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
		buffer.WriteString("\"")

		buffer.WriteString(", \"IsDelete\":")
		buffer.WriteString("\"")
		buffer.WriteString(strconv.FormatBool(response.IsDelete))
		buffer.WriteString("\"")

		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	return buffer.String(), nil
}
