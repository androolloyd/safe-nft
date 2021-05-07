# SafeNFT

> Safe NFT is a wrapper for any ERC721 asset that lets it have a safety hatch to retrieve the asset. 


Deployment Parameters
``
ERC721 _token, uint256 _tokenId, address _guardian, string memory _name, string memory _symbol
``

Usage:

revokeGuardian()
releaseToAddress(address) : onlyGuardian
releaseToOwner(): requires revokeGuardian to be run first
lockNFT(): onlyGuardian
unlockNFT() : onlyGuardian
