import { assert } from "chai";
import { Contract } from "web3-eth-contract";
import TokenArtifact from "../build/contracts/Token.json";
import TokenSaleArtifact from "../build/contracts/TokenSale.json";
import { TokenInstance, TokenSaleInstance } from "../types/truffle-contracts";

const Token = artifacts.require("Token");
const TokenSale = artifacts.require("TokenSale");

contract("TokenSale", (accounts: any) => {
    let token: TokenInstance, tokenSale: TokenSaleInstance;
    const tokenPrice = 1000000000000000000;
    const tokensAvailable = 750000;

    beforeEach(async () => {
        token = await Token.new(tokensAvailable);
        tokenSale = await TokenSale.new(token.address, tokenPrice, { from: accounts[0] });
    });

    it("should have correct values", async () => {
        const tokenContractAddress = await tokenSale.tokenContract();
        const price = await tokenSale.tokenPrice();

        assert.equal(tokenContractAddress, token.address);
        assert.equal(price, tokenPrice);
    });

    it("should allow buying tokens", async () => {
        const buyer = accounts[1];
        const numberOfTokens = 3;

        const value = numberOfTokens * tokenPrice;

        await token.transfer(tokenSale.address, numberOfTokens, { from: accounts[0] });

        const initialBuyerBalance = await token.balanceOf(buyer);
        const initialTokenSaleBalance = await token.balanceOf(tokenSale.address);

        await tokenSale.buyTokens(numberOfTokens, { from: buyer, value: value });

        const newBuyerBalance = await token.balanceOf(buyer);
        const newTokenSaleBalance = await token.balanceOf(tokenSale.address);

        assert.equal(newBuyerBalance, initialBuyerBalance + numberOfTokens);
        assert.equal(newTokenSaleBalance, initialTokenSaleBalance - numberOfTokens);

        const event = await tokenSale.getPastEvents("Sell", { fromBlock: 0, toBlock: "latest" });
        const log = event[0].args;

        assert.equal(log._buyer, buyer);
        assert.equal(log._amount, numberOfTokens);
    });

    it("should not allow buying tokens with incorrect value", async () => {
        const buyer = accounts[1];
        const numberOfTokens = 3;

        try {
            await tokenSale.buyTokens(numberOfTokens, { from: buyer, value: 1 });
            assert.fail();
        } catch (error: any) {
            assert(error.message.indexOf("revert") >= 0);
        }
    });

    it("should not allow buying more tokens than available", async () => {
        const buyer = accounts[1];
        const numberOfTokens = tokensAvailable + 1;

        try {
            await tokenSale.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice });
            assert.fail();
        } catch (error: any) {
            assert(error.message.indexOf("revert") >= 0);
        }
    });

    it("should allow admin to end sale and transfer remaining tokens and ether", async () => {
        const admin = accounts[0];
        await tokenSale.endSale({ from: admin });

        const tokenSaleBalance = await token.balanceOf(tokenSale.address);
        const adminBalance = await token.balanceOf(admin);

        assert.equal(tokenSaleBalance, 0);
        assert.equal(adminBalance, 750000);

        const balance = await web3.eth.getBalance(tokenSale.address);

        assert.equal(balance, 0);
    });

    it("should not allow non-admin to end sale", async () => {
        const buyer = accounts[1];

        try {
            await tokenSale.endSale({ from: buyer });
            assert.fail();
        } catch (error: any) {
            assert(error.message.indexOf("revert") >= 0);
        }
    });
});

