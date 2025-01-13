// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract ArcBondingCurveMarketplace {
    struct Post {
        uint256 totalSupply;
        uint256 a;
        uint256 b;
        address creator;
        bool exists;
    }

    IERC20 public investmentToken;
    mapping(string => Post) public posts;
    mapping(string => mapping(address => uint256)) public balances;
    mapping(string => mapping(address => uint256)) public userInvested;

    // New: maps a user to a list of all posts they've invested in.
    mapping(address => string[]) private userPostsInvested;

    event PostCreated(string indexed postId, address indexed creator, uint256 a, uint256 b);
    event Invested(string indexed postId, address indexed investor, uint256 tokensMinted, uint256 cost);
    event Withdrawn(string indexed postId, address indexed investor, uint256 tokensBurned, uint256 returnAmount, uint256 profit);

    constructor(IERC20 _investmentToken) {
        investmentToken = _investmentToken;
    }

    function createPost(string memory postId, uint256 a, uint256 b) external {
        require(!posts[postId].exists, "Post exists");
        posts[postId] = Post(0, a, b, msg.sender, true);
        emit PostCreated(postId, msg.sender, a, b);
    }

    function investInPost(string memory postId, uint256 tokensToBuy) external {
        Post storage p = posts[postId];
        require(p.exists, "No post");
        require(tokensToBuy > 0, "Zero tokens");

        uint256 S = p.totalSupply;
        uint256 N = tokensToBuy;
        uint256 cost = (p.a * ((S+N)**2 - S**2) / 2) + (p.b * N);

        require(investmentToken.transferFrom(msg.sender, address(this), cost), "Payment failed");

        bool firstInvestment = (balances[postId][msg.sender] == 0);

        p.totalSupply = S + N;
        balances[postId][msg.sender] += N;
        userInvested[postId][msg.sender] += cost;

        // If this is the user's first time investing in this post,
        // add the postId to their list of invested posts.
        if (firstInvestment) {
            userPostsInvested[msg.sender].push(postId);
        }

        emit Invested(postId, msg.sender, N, cost);
    }

    function withdrawFromPost(string memory postId, uint256 tokensToSell) external {
        Post storage p = posts[postId];
        require(p.exists, "No post");
        uint256 userOwned = balances[postId][msg.sender];
        require(tokensToSell > 0 && tokensToSell <= userOwned, "Invalid amount");

        uint256 S = p.totalSupply;
        uint256 N = tokensToSell;
        uint256 returnAmount = ((p.a * (S**2)) / 2 + p.b * S)
                             - ((p.a * ((S - N)**2)) / 2 + p.b * (S - N));

        p.totalSupply = S - N;

        uint256 totalInvested = userInvested[postId][msg.sender];
        uint256 totalTokens = balances[postId][msg.sender];
        uint256 avgCost = totalTokens > 0 ? totalInvested / totalTokens : 0;
        uint256 costForThese = avgCost * N;
        uint256 profit = returnAmount > costForThese ? returnAmount - costForThese : 0;

        balances[postId][msg.sender] = totalTokens - N;
        userInvested[postId][msg.sender] = totalInvested - costForThese;

        require(investmentToken.transfer(msg.sender, returnAmount), "Return failed");

        emit Withdrawn(postId, msg.sender, N, returnAmount, profit);
    }

    function getCurrentSingleShareBuyPrice(string memory postId) external view returns (uint256) {
        Post memory p = posts[postId];
        require(p.exists, "No post");
        return (p.a * p.totalSupply) + p.b;
    }

    function getCostForShares(string memory postId, uint256 N) external view returns (uint256) {
        Post memory p = posts[postId];
        require(p.exists, "No post");
        uint256 S = p.totalSupply;
        return (p.a * ((S+N)**2 - S**2) / 2) + (p.b * N);
    }

 function getReturnForShares(string memory postId, uint256 N) public view returns (uint256) {
        Post memory p = posts[postId];
        require(p.exists, "No post");
        uint256 S = p.totalSupply;
        return ((p.a * (S**2)) / 2 + p.b * S)
             - ((p.a * ((S - N)**2)) / 2 + p.b * (S - N));
    }

    // New function to get all the posts in which a user has invested
    function getUserInvestedPosts(address user) external view returns (string[] memory) {
        return userPostsInvested[user];
    }

    /**
     * @notice Returns the current profit/loss for a user on a given post.
     * Profit/loss = (If the user sold all tokens now) - (What they invested)
     */
    function getUserProfitOrLossForPost(string memory postId, address user) external view returns (int256) {
        Post memory p = posts[postId];
        require(p.exists, "No post");

        uint256 balance = balances[postId][user];
        uint256 invested = userInvested[postId][user];

        // If user has no tokens, no current profit/loss (they've sold everything already)
        if (balance == 0) {
            // Since userInvested updates after selling, if balance is 0, invested should also be 0.
            // Just to be safe, return 0 in that case.
            return 0;
        }

        uint256 currentReturn = getReturnForShares(postId, balance);
        int256 profitOrLoss = int256(currentReturn) - int256(invested);
        return profitOrLoss;
    }
}
