const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const ReverseAuction = await hre.ethers.getContractFactory("ReverseAuction");
    const numWinners = 3; // Set number of winners
    const maxBid = ethers.parseUnits("0.1"); // Set your desired max bid in Ether

    // Deploy the contract with the specified parameters
    const reverseAuction = await ReverseAuction.deploy(numWinners, maxBid, { value: ethers.parseUnits("0.3") });

    await reverseAuction.waitForDeployment("1");

    console.log("ReverseAuction deployed to:", reverseAuction.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });