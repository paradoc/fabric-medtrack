# fabric-medtrack

A full-stack web application that utilizes [Hyperledger Fabric](https://github.com/hyperledger/fabric) as the blockchain framework and [Hyperledger Fabric Gateway](https://github.com/hyperledger/fabric-gateway/) as the application gateway.

This project was created in partial fulfillment of the requirements for IS295b.

# Quickstart

## Disclaimer

This __might__ only run on Apple M2 systems.

## Prerequisites

1. k8s network is up and running and the chaincode has been installed (see `README.md` in `network-k8s` subdirectory)
2. Gateway modules are installed and tidied `cd gateway && go mod install && go mod tidy`
3. UI dependencies are installed
4. Start the API gateway `cd gateway && ./start.sh`

## Run the UI

Start without SSL

```bash
cd ui && pnpm dev
```

Start with SSL

```bash
cd ui && pnpm start
```

## Run the UI and tunnel using [ngrok](https://ngrok.com/)

1. Modify `./ui/.env` and update the value of `VITE_NGROK_URL`

2. Start with SSL

```bash
cd ui && pnpm start
```