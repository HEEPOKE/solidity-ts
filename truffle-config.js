module.exports = {
    networks: {
      development: {
        host: "127.0.0.1",
        port: 8545,
        network_id: "*",
      },
    },
    compilers: {
      solc: {
        version: "0.8.9",
      },
    },
    mocha: {
      reporter: "eth-gas-reporter",
      reporterOptions: {
        currency: "USD",
        gasPrice: 10,
      },
    },
    plugins: ["solidity-coverage"],
  };
