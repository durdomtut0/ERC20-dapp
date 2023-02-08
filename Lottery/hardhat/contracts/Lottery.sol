// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract Lottery is VRFConsumerBaseV2, ConfirmedOwner {
    //Game states
    bool public gameStarted;
    uint256 entryFee = 0.01 ether;
    uint256 gameId;
    mapping (uint256 => address) playersAddress;
    uint256 public gameStartedTimestamp;
    event GameStarted(
        uint256 gameId,
        address playerAdress,
        uint256 gameStartedTimestamp
    );
    event GameEnded(
        uint256 gameId,
        address playerAddress,
        uint256 requestId,
        uint256 slot1,
        uint256 slot2,
        uint256 slot3,
        bool isWinner
    );

    //Chainlink states
    uint64 s_subscriptionId;
    VRFCoordinatorV2Interface COORDINATOR;
    bytes32 keyHash = 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 3; //3 numbers

    constructor (
        uint64 subscriptionId
    ) payable
        VRFConsumerBaseV2(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed)
        ConfirmedOwner(msg.sender)
    {
        COORDINATOR = VRFCoordinatorV2Interface(
            0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed
        );
        s_subscriptionId = subscriptionId;
        gameStarted = false;
    }

    function startGame() public payable {
        require(msg.value == entryFee, "supply the entry fee");
        gameId += 1;
        playersAddress[gameId] = msg.sender;
        requestRandomWords();
        emit GameStarted(gameId, msg.sender, block.timestamp);
    }

    function requestRandomWords() internal returns (uint256 requestId) {
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        return requestId;
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal virtual override {
        //TODO I will pick winners
        uint256 slot1 = randomWords[0]%3+1;
        uint256 slot2 = randomWords[1]%3+1;
        uint256 slot3 = randomWords[2]%3+1;
        bool isWinner = (slot1 == slot2 || slot2 == slot3  || slot1 == slot3) ? true : false;
        emit GameEnded(
            gameId,
            playersAddress[gameId],
            requestId,
            slot1,
            slot2,
            slot3,
            isWinner
        );
        if (isWinner){
            (bool success, ) = playersAddress[gameId].call{value: entryFee*2}("");
            require(success, "Failed to send Ether");
        }
    }
    function withdraw() public onlyOwner{
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
            require(success, "Failed to send Ether");
    }
}

//graph init --contract-name Lottery --product hosted-service durdomtut0/lottery2  --from-contract 0xaDE525ceb51a5F11e8E3BeDDb4FD5Eb273D17047  --abi ./abi.json --network mumbai graph

