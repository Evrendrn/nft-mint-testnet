// SPDX-License-Identifier: UNLICENSE
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NFTMARLAFREE is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address public owner = 0xD4F1b63c2bb5D6eabE5729B347F5978e544A23B7;
    uint256 public normalPrice = 50000000000000000;
    uint256 public totalMint = 0;
    uint256 public maxMint = 110;
    string public baseUrl = "https://crypto-nfts.mypinata.cloud/ipfs/Qmck2EFdiLbYETDZr9sY261fEcb6t7tZ3CQnpGnAofPJ4Q/";
    bool public mintingStatus = true;

    constructor() ERC721("Marla NFTS", "MarlaNFT") {}

    receive() external payable {}

    modifier onlyOwner() {
        require(msg.sender == owner, "ADMIN_ONLY");
        _;
    }

    function append(
        string memory a,
        string memory b,
        string memory c
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(a, b, c));
    }

    function mint(address player, uint256 tokenCount) public payable {
        require(mintingStatus);
        require(totalMint <= maxMint);
        require(normalPrice * tokenCount <= msg.value);
        for (uint256 i = 0; i < tokenCount; i++) {
            uint256 newItemId = _tokenIds.current();
            _tokenIds.increment();
            _mint(player, newItemId);
            _setTokenURI(
                newItemId,
                append(baseUrl, Strings.toString(newItemId + 1), ".json")
            );
            totalMint++;
        }
    }

    function claimBalance() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function changeStatus() external onlyOwner {
        mintingStatus = !mintingStatus;
    }

    function ownerAwardItem(address player, uint256 tokenCount)
        public
        payable
        onlyOwner
    {
        for (uint256 i = 0; i < tokenCount; i++) {
            uint256 newItemId = _tokenIds.current();
            _tokenIds.increment();
            _mint(player, newItemId);
            _setTokenURI(
                newItemId,
                append(baseUrl, Strings.toString(newItemId + 1), ".json")
            );
            totalMint++;
        }
    }

    function changeOwner(address adres) external onlyOwner {
        require(adres != address(0x0));
        owner = adres;
    }
}
