package connection

import (
	"crypto/x509"
	"fmt"
	"os"
	"path"
	"time"

	"github.com/hyperledger/fabric-gateway/pkg/client"
	"github.com/hyperledger/fabric-gateway/pkg/identity"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

type FabricConf struct {
	MspId         string
	CryptoPath    string
	CertPath      string
	KeyPath       string
	TlsCertPath   string
	PeerEndpoint  string
	GatewayPeer   string
	ChaincodeName string
	ChannelName   string
}

type GatewayConn struct {
	ClientConn *grpc.ClientConn
	Gateway    *client.Gateway
	Contract   *client.Contract
}

func (conn *GatewayConn) Close() {
	defer conn.ClientConn.Close()
	defer conn.Gateway.Close()
}

func Init(conf FabricConf, conn *GatewayConn) {
	conn.ClientConn = newGrpcConnection(conf)

	id := newIdentity(conf)
	sign := newSign(conf)

	// Create a Gateway connection for a specific client identity
	gw, err := client.Connect(
		id,
		client.WithSign(sign),
		client.WithClientConnection(conn.ClientConn),
		// Default timeouts for different gRPC calls
		client.WithEvaluateTimeout(5*time.Second),
		client.WithEndorseTimeout(15*time.Second),
		client.WithSubmitTimeout(5*time.Second),
		client.WithCommitStatusTimeout(1*time.Minute),
	)
	if err != nil {
		panic(err)
	}
	conn.Gateway = gw
	network := gw.GetNetwork(conf.ChannelName)
	conn.Contract = network.GetContract(conf.ChaincodeName)
}

// newGrpcConnection creates a gRPC connection to the Gateway server.
func newGrpcConnection(conf FabricConf) *grpc.ClientConn {
	certificate, err := loadCertificate(conf.TlsCertPath)
	if err != nil {
		panic(err)
	}

	certPool := x509.NewCertPool()
	certPool.AddCert(certificate)
	transportCredentials := credentials.NewClientTLSFromCert(certPool, conf.GatewayPeer)

	connection, err := grpc.Dial(conf.PeerEndpoint, grpc.WithTransportCredentials(transportCredentials))
	if err != nil {
		panic(fmt.Errorf("failed to create gRPC connection: %w", err))
	}

	return connection
}

func loadCertificate(filename string) (*x509.Certificate, error) {
	certificatePEM, err := os.ReadFile(filename)
	if err != nil {
		return nil, fmt.Errorf("failed to read certificate file: %w", err)
	}
	return identity.CertificateFromPEM(certificatePEM)
}

// newSign creates a function that generates a digital signature from a message digest using a private key.
func newSign(conf FabricConf) identity.Sign {
	files, err := os.ReadDir(conf.KeyPath)
	if err != nil {
		panic(fmt.Errorf("failed to read private key directory: %w", err))
	}
	privateKeyPEM, err := os.ReadFile(path.Join(conf.KeyPath, files[0].Name()))

	if err != nil {
		panic(fmt.Errorf("failed to read private key file: %w", err))
	}

	privateKey, err := identity.PrivateKeyFromPEM(privateKeyPEM)
	if err != nil {
		panic(err)
	}

	sign, err := identity.NewPrivateKeySign(privateKey)
	if err != nil {
		panic(err)
	}

	return sign
}

// newIdentity creates a client identity for this Gateway connection using an X.509 certificate.
func newIdentity(conf FabricConf) *identity.X509Identity {
	certificate, err := loadCertificate(conf.CertPath)
	if err != nil {
		panic(err)
	}

	id, err := identity.NewX509Identity(conf.MspId, certificate)
	if err != nil {
		panic(err)
	}

	return id
}
