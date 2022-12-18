# MedTrack Gateway

This is the gateway for communication between the UI and the blockchain network.

Folder structure and templates were built using github.com/zeromicro/go-zero.

Default config file is located in `./src/etc/gateway.yaml`

## API endpoints

### POST /dispatch

Creates a new medication dispatch transaction with the blockchain.

This is the endpoint used in the UI /dispatcher/new route when the user submits a new dispatch request.

### GET /query

Finds medication dispatch and user input history by generic name and date range.

This is the endpoint used in the UI /watcher route when a user submits a query.

### PUT /update

Inputs user history for a dispatch ID.

This is the endpoint used in the UI /collector route when the user clicks the OK button.

### GET /read/:id

Gets a dispatch transaction by dispatch ID (:id).

This is the endpoint used in the UI /collector route and /dispatcher/inspect to get data for a single dispatch ID.

### GET /recent/:lim

Gets the last N (:lim) recent dispatches.

This endpoint is used in the UI /dispatcher to see the data in the feed.

## Quickstart

Run a local instance on port `8888` (editable in config file)

```bash
./start.sh
```