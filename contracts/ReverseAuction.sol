// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReverseAuction {
    address public auctionCreator;
    uint public numWinners;
    uint public maxBid;
    uint public lockedFunds;
    bool public auctionEnded;

    struct Bid {
        address bidder;
        uint amount;
    }

    Bid[] public bids;
    mapping(address => bool) public hasBid;

    event AuctionCreated(uint numWinners, uint maxBid, uint lockedFunds);
    event BidSubmited(address bidder, uint amount);
    event RemainingFundsReturned(address auctionCreator, uint amount);
    event AuctionEnded(Bid[] Winners, uint rewardPerWinner);

    constructor(uint _numWinners, uint _maxBid) payable {
        require(_numWinners > 0, "Number of winners must be greater than 0");
        require(_maxBid > 0, "Maximumm bid should be greater than 0");

        auctionCreator = msg.sender;
        numWinners = _numWinners;
        maxBid = _maxBid;
        lockedFunds = _numWinners * _maxBid;

        require(msg.value >= lockedFunds, "Incorrect funds provided for auction");
        emit AuctionCreated(_numWinners, _maxBid, lockedFunds);
    }

    function submitBid() external payable {
        require(!auctionEnded, "Auction has already ended");
        require(msg.value <= maxBid, "Bid exceeds maximum allowed value");
        require(!hasBid[msg.sender], "You can only bid once");

        bids.push(Bid({bidder: msg.sender, amount: msg.value}));
        hasBid[msg.sender] = true;
        emit BidSubmited(msg.sender, msg.value);
    }

    function endAuction() external {
        require(msg.sender == auctionCreator, "Only the auction creator can end the auction");
        require(!auctionEnded, "Auction has already ended");
        require(bids.length > 0, "No bids submitted");

        auctionEnded = true;

        sortBids(); //sorting in ascending order

        //Winners
        uint winnerCount = bids.length < numWinners ? bids.length : numWinners;
        uint highestWinningBid = bids[winnerCount - 1].amount;
        uint totalReward = highestWinningBid * winnerCount;

        //Pay the winners
        for(uint i = 0; i < winnerCount; i++) {
            payable(bids[i].bidder).transfer(highestWinningBid);
        }

        //Return the remaining funds to the auction creator
        uint remainingFunds = lockedFunds - totalReward;
        if(remainingFunds > 0) {
            payable(auctionCreator).transfer(remainingFunds);
            emit RemainingFundsReturned(auctionCreator, remainingFunds);
        }

        Bid[] memory winningBids = new Bid[](winnerCount);
        for(uint i = 0; i < winnerCount; i++) {
            winningBids[i] = bids[i];
        }

        emit AuctionEnded(winningBids, highestWinningBid);
    }

    function sortBids() internal {
        for(uint i = 0; i < bids.length; i++) {
            for(uint j = i + 1; j < bids.length; j++) {
                if(bids[i].amount > bids[j].amount) {
                    Bid memory temp = bids[i];
                    bids[i] = bids[j];
                    bids[j] = temp;
                }
            }
        }
    }
}