// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";


contract DummyNFT is ERC721 {

    mapping (uint256 => string ) public hashes;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        _mint(msg.sender, 1);
        hashes[1] = "QmNXx7SPvC6Huc6JKMM6kLbBKHDMyaSRY5han7vBMj7i4o";
    }
    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0
        ? string(abi.encodePacked(baseURI, hashes[tokenId], "/metadata.json"))
        : '';
    }

    /**
     * @dev Base URI for computing {tokenURI}. Empty by default, can be overriden
     * in child contracts.
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return "http://ipfs.io/ipfs/";
    }
}
