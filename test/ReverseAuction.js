const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("ReverseAuction Contract", function () {
    let ReverseAuction, reverseAuction, owner, bidder1, bidder2, bidder3;

    beforeEach(async function () {
        [owner, bidder1, bidder2, bidder3] = await ethers.getSigners();

        // Deploy the contract with small values in wei
        const numWinners = 2; // Number of winners
        const maxBid = ethers.parseUnits("0.1", "ether"); // Max bid: 0.1 ETH in wei
        const lockedFunds = ethers.parseUnits("0.2", "ether"); // Locked funds for 2 winners

        ReverseAuction = await ethers.getContractFactory("ReverseAuction");
        reverseAuction = await ReverseAuction.deploy(numWinners, maxBid, { value: lockedFunds });
        await reverseAuction.waitForDeployment();
    });

    it("Should initialize the contract correctly", async function () {
        expect(await reverseAuction.numWinners()).to.equal(2);
        expect(await reverseAuction.maxBid()).to.equal(ethers.parseUnits("0.1", "ether"));
        expect(await reverseAuction.lockedFunds()).to.equal(ethers.parseUnits("0.2", "ether"));
        expect(await reverseAuction.auctionCreator()).to.equal(owner.address);
    });

    it("Should allow valid bids", async function () {
        await reverseAuction.connect(bidder1).submitBid({ value: ethers.parseUnits("0.05", "ether") });
        const bid = await reverseAuction.bids(0);
        expect(bid.bidder).to.equal(bidder1.address);
        expect(bid.amount).to.equal(ethers.parseUnits("0.05", "ether"));

        const hasBid = await reverseAuction.hasBid(bidder1.address);
        expect(hasBid).to.be.true;
    });

    it("Should not allow a bid exceeding maxBid", async function () {
        await expect(reverseAuction.connect(bidder1).submitBid({ value: ethers.parseUnits("0.2", "ether") }))
            .to.be.revertedWith("Bid exceeds maximum allowed value");
    });

    it("Should not allow a second bid from the same account", async function () {
        await reverseAuction.connect(bidder1).submitBid({ value: ethers.parseUnits("0.05", "ether") });
        await expect(reverseAuction.connect(bidder1).submitBid({ value: ethers.parseUnits("0.03", "ether") }))
            .to.be.revertedWith("You can only bid once");
    });

    it("Should allow the creator to end the auction", async function () {
        await reverseAuction.connect(bidder1).submitBid({ value: ethers.parseUnits("0.05", "ether") });
        await reverseAuction.connect(bidder2).submitBid({ value: ethers.parseUnits("0.07", "ether") });

        await reverseAuction.connect(owner).endAuction();

        const auctionEnded = await reverseAuction.auctionEnded();
        expect(auctionEnded).to.be.true;
    });

    it("Should return remaining funds to the creator after ending the auction", async function () {
        await reverseAuction.connect(bidder1).submitBid({ value: ethers.parseUnits("0.05", "ether") });
        await reverseAuction.connect(bidder2).submitBid({ value: ethers.parseUnits("0.04", "ether") });

        const creatorInitialBalance = BigInt(await ethers.provider.getBalance(owner.address));

        const tx = await reverseAuction.connect(owner).endAuction();
        const receipt = await tx.wait();

        const txDetails = await ethers.provider.getTransaction(tx.hash);
        const gasCost = BigInt(receipt.gasUsed) * BigInt(txDetails.gasPrice);

        const creatorFinalBalance = BigInt(await ethers.provider.getBalance(owner.address));

        //Calculate remaining funds returned to auction creator
        const lockedFunds = BigInt(ethers.parseUnits("0.2", "ether"));
        const highestWinningBid = BigInt(ethers.parseUnits("0.05", "ether"));
        const numWinners = 2;
        const totalReward = highestWinningBid * BigInt(numWinners);
        const remainingFunds = lockedFunds - totalReward;

        // Locked funds: 0.2 ETH, used: 0.09 ETH, remaining 0.11 ETH
        const expectedFinalBalance = creatorInitialBalance + remainingFunds - gasCost;

        //Assert that final balances matches the expected balance
        expect(creatorFinalBalance).to.equal(expectedFinalBalance);
    });
});
