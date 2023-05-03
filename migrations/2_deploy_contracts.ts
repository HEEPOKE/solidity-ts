import { Deployer } from "truffle";

const Token = artifacts.require("Token");
const TokenSale = artifacts.require("TokenSale");

module.exports = async function (deployer: Deployer) {
  await deployer.deploy(Token, 1000000000000000000);
  const token: Contract = await Token.deployed();
  await deployer.deploy(TokenSale, token.address, 1000000000000000000);
};
