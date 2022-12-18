# MedTrack Network

This subfolder contains the network setup and configuration needed to create the Fabric network.

The test network is configured to run on k3s provided by Rancher.

This is a fork of https://github.com/hyperledger/fabric-samples/tree/main/test-network-k8s but updated for Apple M2 processor.

## Disclaimer

This subfolder is tailored to work on Apple's M2 processor, which might need to be reconfigured for other machines.

See https://jira.hyperledger.org/browse/FAB-18389 for more details.

## Quickstart

### Create a cluster

```bash
./network cluster init
```

### Launch the network and create a channel

```bash
./network up

./network channel create
```

### Deploy the smart contract.

```bash
./network chaincode deploy <chaincode-name> ../cc <sequence-number>
```

Where `chaincode-name` is a string and `sequence-number` is an integer incremented on every chaincode install.

### Shutdown the network and tear down the cluster

```bash
./network down

./network cluster clean
```

## Troubleshooting

### Problem - x509: certificate has expired or is not yet valid

Error from server (InternalError): error when creating "kube/root-tls-cert-issuer.yaml": Internal error occurred: failed calling webhook "webhook.cert-manager.io": failed to call webhook: Post "https://cert-manager-webhook.cert-manager.svc:443/mutate?timeout=10s": x509: certificate has expired or is not yet valid

### Solution

1. Shutdown the network and teardown the cluster
2. Restart Docker and Rancher
