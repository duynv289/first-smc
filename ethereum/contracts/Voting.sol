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
    mapping(address => bool) public withdrawed;
    uint256 timer;
    uint256 timeVote = 7 * 24 * 60 * 60; // 1 week
    uint256 amountDeposit = 100 * 1000000000000000000; // 100$
    IERC20 erc20;

    function Voting() public {
        owner = msg.sender;
        erc20 = IERC20(address(0xD9BA894E0097f8cC2BBc9D24D308b98e36dc6D02));
    }

    modifier restricted() {
        require(voted[msg.sender] || msg.sender == owner);
        _;
    }

    function contribute() public {
        require(players.length < 3);
        require(!allowed[msg.sender]);
        allowed[msg.sender] = true;
        erc20.transferFrom(msg.sender, address(this), amountDeposit);
        players.push(msg.sender);
        if (players.length == 3) {
            timer = block.timestamp;
        }
    }

    function voteScore(uint256 score) public {
        require(block.timestamp - timer <= timeVote);
        require(allowed[msg.sender]);
        require(!voted[msg.sender]);
        voted[msg.sender] = true;
        totalScore += score;
        counter++;
    }

    function checkCounterTime() public view returns (uint256) {
        if (timeVote > block.timestamp - timer) {
            return timeVote - (block.timestamp - timer);
        } else {
            return 0;
        }
    }

    function withdraw() public restricted returns (bool) {
        require(checkCounterTime() == 0);
        require(!withdrawed[msg.sender]);
        uint256 avarageScore = getAvarageScore();
        if (avarageScore >= 7 && msg.sender == owner) {
            erc20.transfer(msg.sender, 3 * amountDeposit);
            withdrawed[msg.sender] = true;
            return true;
        } else if (avarageScore < 7 && voted[msg.sender]) {
            erc20.transfer(msg.sender, amountDeposit);
            withdrawed[msg.sender] = true;
            return true;
        }
        return false;
    }

    function getAvarageScore() public view returns (uint256) {
        return (totalScore + (3 - counter) * 10) / 3;
    }

    function getPlayers() public view returns (address[]) {
        return players;
    }
}
