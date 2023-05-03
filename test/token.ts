import { assert } from "chai";
import { Contract } from "web3-eth-contract";
import TokenArtifact from "../build/contracts/Token.json";
import { TokenInstance } from "../types/truffle-contracts";

const Token = artifacts.require("Token");

contract("Token", (accounts: any) => {
    let token: TokenInstance;

    beforeEach(async () => {
        token = await Token.new(1000000000000000000);
    });

    it("should have correct name and symbol", async () => {
        const name = await token.name();
        const symbol = await token.symbol();

        assert.equal(name, "My Token");
        assert.equal(symbol, "MTK");
    });

    it("should have correct total supply and balance", async () => {
        const totalSupply = await token.totalSupply();
        const balance = await token.balanceOf(accounts[0]);

        assert.equal(totalSupply, 1000000000000000000);
        assert.equal(balance, 1000000000000000000);
    });

    it("should allow transfer of tokens", async () => {
        const transferAmount = 100000;
        const balanceBefore = await token.balanceOf(accounts[0]);

        await token.transfer(accounts[1], transferAmount);

        const balanceAfter = await token.balanceOf(accounts[0]);
        const balanceReceiver = await token.balanceOf(accounts[1]);

        assert.equal(balanceBefore - transferAmount, balanceAfter);
        assert.equal(balanceReceiver, transferAmount);
    });

    it("should not allow transfer of more tokens than balance", async () => {
        const transferAmount = 2000000000000000000;

        try {
            await token.transfer(accounts[1], transferAmount);
            assert.fail();
        } catch (error: any) {
            assert(error.message.indexOf("revert") >= 0);
        }
    });
});
