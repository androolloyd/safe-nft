// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";


contract SafeNFT is ERC721, IERC721Receiver {

    ERC721 public safeAsset;
    uint256 public assetId;
    address public guardian;

    event Deposit(address tokenAddress, uint256 tokenId);
    event ReleaseTo(address receiver);
    event RevokeGuardian();

    constructor(
        ERC721 _token,
        uint _tokenId,
        address _guardian,
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        guardian = _guardian;
        safeAsset = _token;
        assetId = _tokenId;
        _mint(msg.sender, _tokenId);
    }

    modifier onlyGuardian() {
        require(msg.sender == guardian);
        _;
    }

    function revokeGuardian() public onlyGuardian {
        guardian = address(0);
        emit RevokeGuardian();
    }

    function releaseToAddress(address releaseTo) public onlyGuardian { //call back from the fractional contract when you release the nft back in
        safeAsset.safeTransferFrom(address(this), releaseTo, assetId);
        emit ReleaseTo(releaseTo);
        selfdestruct(payable(address(guardian)));
    }

    function releaseToOwner(bytes calldata data) public { //call back from the fractional contract when you release the nft back in
        address owner = ownerOf(assetId);
        require(owner == msg.sender);
        require(guardian == address(0));
        safeAsset.safeTransferFrom(address(this), owner, assetId, data);
        emit ReleaseTo(owner);
        selfdestruct(payable(address(owner)));
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        return safeAsset.tokenURI(tokenId);
    }

    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) override external returns (bytes4) {
        require(tokenId == assetId, "Wrong asset Deposited");
        require(safeAsset.ownerOf(assetId) == address(this));
        emit Deposit(address(safeAsset), assetId);
        return IERC721Receiver.onERC721Received.selector;
    }
}
