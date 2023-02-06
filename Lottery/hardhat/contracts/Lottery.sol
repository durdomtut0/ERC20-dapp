// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract Lottery is VRFConsumerBaseV2, ConfirmedOwner {
    //Game states
    bool public gameStarted;
    uint256 entryFee = 0.01 ether;
    uint256 public gameId;
    uint256 public gameStartedTimestamp;
    event GameStarted(
        uint256 gameId,
        address player,
        uint256 gameStartedTimestamp
    );
    event GameEnded(
        uint256 gameId,
        uint256 slot1,
        uint256 slot2,
        uint256 slot3,
        bool isWinner
    );

    //Chainlink states
    uint64 s_subscriptionId;
    VRFCoordinatorV2Interface COORDINATOR;
    bytes32 keyHash =
        0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314;
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 3; //3 numbers

    constructor(
        uint64 subscriptionId
    )
        VRFConsumerBaseV2(0x6A2AAd07396B36Fe02a22b33cf443582f682c82f)
        ConfirmedOwner(msg.sender)
    {
        COORDINATOR = VRFCoordinatorV2Interface(
            0x6A2AAd07396B36Fe02a22b33cf443582f682c82f
        );
        s_subscriptionId = subscriptionId;
        gameStarted = false;
    }

    function startGame() public payable {
        require(msg.value == entryFee, "supply the entry fee");
        gameId += 1;
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
        emit GameEnded(
            gameId,
            randomWords[0],
            randomWords[1],
            randomWords[2],
            (randomWords[0]+randomWords[1]+randomWords[2]>50) ? true : false
        );
    }
}
