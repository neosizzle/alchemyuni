// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "../core/dependencies/openzeppelin/contracts/Ownable.sol";
import "../core/dependencies/openzeppelin/contracts/SafeMath.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IMultiFeeDistribution {

    function addReward(address rewardsToken) external;
    function mint(address user, uint256 amount, bool withPenalty) external;

}

contract MerkleDistributor is Ownable {
    using SafeMath for uint256;

    struct ClaimRecord {
        bytes32 merkleRoot;
        uint256 validUntil;
        uint256 total;
        uint256 claimed;
    }

    uint256 public immutable maxMintableTokens;
    uint256 public mintedTokens;
    uint256 public reservedTokens;
    uint256 public immutable startTime;
    uint256 public constant duration = 86400 * 365;
    uint256 public constant minDuration = 86400 * 7;

    IMultiFeeDistribution public rewardMinter;

    ClaimRecord[] public claims;

    event Claimed(
        address indexed account,
        uint256 indexed merkleIndex,
        uint256 index,
        uint256 amount,
        address receiver
    );

    // This is a packed array of booleans.
    mapping(uint256 => mapping(uint256 => uint256)) private claimedBitMap;

    constructor(IMultiFeeDistribution _rewardMinter, uint256 _maxMintable) Ownable() {
        rewardMinter = _rewardMinter;
        maxMintableTokens = _maxMintable;
        startTime = block.timestamp;
    }

    function mintableBalance() public view returns (uint256) {
        uint elapsedTime = block.timestamp.sub(startTime);
        if (elapsedTime > duration) elapsedTime = duration;
        return maxMintableTokens.mul(elapsedTime).div(duration).sub(mintedTokens).sub(reservedTokens);
    }

    // DEV , add onlyowner
    function addClaimRecord(bytes32 _root, uint256 _duration, uint256 _total) external {
        require(_duration >= minDuration);
        uint mintable = mintableBalance();
        require(mintable >= _total);

        claims.push(ClaimRecord({
            merkleRoot: _root,
            validUntil: block.timestamp + _duration,
            total: _total,
            claimed: 0
        }));
        reservedTokens = reservedTokens.add(_total);

    }

    function releaseExpiredClaimReserves(uint256[] calldata _claimIndexes) external {
        for (uint256 i = 0; i < _claimIndexes.length; i++) {
            ClaimRecord storage c = claims[_claimIndexes[i]];
            require(block.timestamp > c.validUntil, 'MerkleDistributor: Drop still active.');
            reservedTokens = reservedTokens.sub(c.total.sub(c.claimed));
            c.total = 0;
            c.claimed = 0;
        }
    }

    function isClaimed(uint256 _claimIndex, uint256 _index) public view returns (bool) {
        uint256 claimedWordIndex = _index / 256;
        uint256 claimedBitIndex = _index % 256;
        uint256 claimedWord = claimedBitMap[_claimIndex][claimedWordIndex];
        uint256 mask = (1 << claimedBitIndex);
        return claimedWord & mask == mask;
    }

    function _setClaimed(uint256 _claimIndex, uint256 _index) private {
        uint256 claimedWordIndex = _index / 256;
        uint256 claimedBitIndex = _index % 256;
        claimedBitMap[_claimIndex][claimedWordIndex] = claimedBitMap[_claimIndex][claimedWordIndex] | (1 << claimedBitIndex);
    }

    function hash(bytes32 _a) internal pure returns(bytes32) {
      return bytes32(keccak256(abi.encode(_a)));
    }

    function pairHash(bytes32 _a, bytes32 _b) internal pure returns(bytes32) {
      return hash(hash(_a) ^ hash(_b));
    }

     function verify(bytes32[] calldata _proof, bytes32 _root, bytes32 _leaf) internal pure returns (bool) {

        // Verify merkle proof, or revert if not in tree
		bytes32 leaf = _leaf;
		// bool isValidLeaf = MerkleProof.verify(proof, root, leaf);

		bytes32 temp = leaf;
		uint i;

		for(i=0; i<_proof.length; i++) {
            temp = pairHash(temp, _proof[i]);
		}

		bool isValidLeaf = temp == _root;

		return isValidLeaf;
    }

    // index = index of leaf from frontend
    // claimindex = index of protocol, 0 for venus
    function claim(
        uint256 _claimIndex,
        uint256 _index,
        uint256 _amount,
        address _receiver,
        bytes32[] calldata _merkleProof
    ) external {
        // require(_claimIndex == 0 && CALL_FUNC_RES, "You must migrate to claim");
        require(_claimIndex < claims.length, 'MerkleDistributor: Invalid merkleIndex');
        require(!isClaimed(_claimIndex, _index), 'MerkleDistributor: Drop already claimed.');

        ClaimRecord storage c = claims[_claimIndex];
        require(c.validUntil > block.timestamp, 'MerkleDistributor: Drop has expired.');

        c.claimed = c.claimed.add(_amount);
        require(c.total >= c.claimed, 'MerkleDistributor: Exceeds allocated total for drop.');

        reservedTokens = reservedTokens.sub(_amount);
        mintedTokens = mintedTokens.add(_amount);

        // Verify the merkle proof.
        // dev . replce receiver with msg.sender
        bytes32 node = keccak256(abi.encodePacked(_index, _receiver, _amount));
        require(verify(_merkleProof, c.merkleRoot, node), 'MerkleDistributor: Invalid proof.');

        // Mark it claimed and send the token.
        _setClaimed(_claimIndex, _index);
        rewardMinter.mint(_receiver, _amount, true);

        emit Claimed(msg.sender, _claimIndex, _index, _amount, _receiver);
    }

}