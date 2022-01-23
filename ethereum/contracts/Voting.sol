pragma solidity ^0.4.17;

contract Voting {
    event Start();

    address public owner;
    address[] players;
    uint256 public totalScore;
    uint256 public counter;
    mapping(address => bool) public allowed;
    mapping(address => bool) public voted;
    uint256 timer;

    function Voting() public {
        owner = msg.sender;
    }

    modifier restricted() {
        require(msg.sender == owner);
        _;
    }

    function contribute() public payable {
        require(players.length < 1);
        require(!allowed[msg.sender]);
        allowed[msg.sender] = true;
        players.push(msg.sender);
        if (players.length == 1) {
            timer = block.timestamp;
            Start();
        }
    }

    function voteScore(uint256 score) public {
        require(block.timestamp - timer <= 60);
        require(allowed[msg.sender]);
        require(!voted[msg.sender]);
        voted[msg.sender] = true;
        totalScore += score;
        counter++;
    }

    function autoAddTimeUp() private {
        counter += players.length - counter;
        totalScore += (players.length - counter) * 10;
    }

    function checkCounterTime() public view returns (uint256) {
        if (60 > block.timestamp - timer) {
            return 60 - (block.timestamp - timer);
        } else {
            return 0;
        }
    }

    function withdraw(uint256 amount) public restricted {
        require(allowed[msg.sender]);
        msg.sender.transfer(amount);
        for (uint256 i = 0; i < 1; i++) {
            allowed[players[i]] = false;
            voted[players[i]] = false;
        }
        players = new address[](0);
        totalScore = 0;
        counter = 0;
    }

    function getPlayers() public view returns (address[]) {
        return players;
    }
}
