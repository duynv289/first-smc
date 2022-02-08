pragma solidity ^0.4.17;

interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract Voting {
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
        require(allowed[msg.sender] || msg.sender == owner);
        _;
    }

    function contribute(IERC20 erc20, uint256 amount) public {
        require(players.length < 3);
        require(!allowed[msg.sender]);
        allowed[msg.sender] = true;
        erc20.transferFrom(msg.sender, address(this), amount);
        players.push(msg.sender);
        if (players.length == 3) {
            timer = block.timestamp;
        }
    }

    function voteScore(uint256 score) public {
        require(block.timestamp - timer <= 7 * 24 * 60 * 60);
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
        if (7 * 24 * 60 * 60 > block.timestamp - timer) {
            return 7 * 24 * 60 * 60 - (block.timestamp - timer);
        } else {
            return 0;
        }
    }

    function withdraw(IERC20 erc20, uint256 amount) public restricted {
        erc20.transfer(msg.sender, amount);
    }

    function reset() public {
        require(msg.sender == owner);
        for (uint256 i = 0; i < 3; i++) {
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
