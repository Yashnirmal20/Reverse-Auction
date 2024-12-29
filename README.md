# Reverse Auction Smart Contract

This repository contains a Reverse Auction smart contract that allows users to place bids, and the auction creator selects the winners based on the lowest bids. The winners are rewarded with the highest bid among them, and any remaining funds are returned to the auction creator.

## Steps for Deploying the Contract
### Prerequisites
- Node.js (version 16 or higher)
- Hardhat (installed via npm)
- Alchemy account for Sepolia testnet access
- Test ETH for the Sepolia network (can be obtained from a faucet)

## Installing Dependencies
- Clone the repository
  - `git clone <repository_url>`
  - `cd reverse-auction`
- Install the required dependencies
  `npm install`

## Deploying the Contract on Sepolia Testnet
- Create an Alchemy RPC URL for the Sepolia testnet:-
- Signup at Alchemy.
- Create a new project and select the Sepolia testnet.
- Copy the RPC URL.
- Setup a .env file and add the following:
- `TESTNET_PRIVATE_KEY: <<ADD YOUR PRIVATE KEY>>`
- `ALCHEMY_TESTNET_RPC_URL: <<ADD THE TESTNET RPC URL>>`
- Modify the `hardhat.config.js` file to include Sepolia Configuration:
   `networks: {
    sepolia: {
        url: process.env.ALCHEMY_SEPOLIA_URL,
        accounts: [process.env.SEPOLIA_PRIVATE_KEY]
    },
  },
  `
- Deploy the contract: `npx hardhat run scripts/deploy.js --network sepolia` The script will deploy the contract and display its address.

## Deploying the Contract on Local Hardhat Network
- Start the local Hardhat network: `npx hardhat node`
- Deploy the contract: `npx hardhat run scripts/deploy.js --network localhost`
- Copy the contract address for interacting with it locally.

### Instructions for Interacting with the Contract
- `ReverseAuction.js` file is present in the test folder. You can customize the tests or values.
- To run the scripts on sepolia: `npx hardhat run scripts/submitBid.js --network sepolia`
- To run the scripts on local machine: `npx harhdat test`

## Example Input and Output for a Sample Reverse Auction
### Contract Parameters
- Number of Winners: 2
- Maximum Bid: 0.1 ETH
- Locked Funds: 0.2 ETH
### Bids
- Bidder 1: 0.05 ETH
- Bidder 2: 0.04 ETH
- Bidder 3: 0.07 ETH
### Output
- Winners: Bidder 1 and Bidder 2.
- Reward per Winner: 0.05 ETH.
- Remaining Funds Returned: 0.1 ETH.