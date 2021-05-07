const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
// const {
//   advanceBlockTo,
//   latestBlock,
//   advanceBlock,
//   increase,
//   increaseTo,
//   latest,
// } = require("./time");

use(solidity);
describe("SafeNFT", function () {

  const ASSET_ID = "1"

  let safeNFTContract;
  let dummyNFT;


  let DEPLOYERSIGNER;
  let DEPLOYERADDR
  let NEWOWNERSIGNER;
  let NEWOWNERADDR;
  let GUARDIANSIGNER;
  let GUARDIANADDR

  before(async function () {
    [DEPLOYERSIGNER, GUARDIANSIGNER, NEWOWNERSIGNER] = await ethers.getSigners();

    DEPLOYERADDR = await DEPLOYERSIGNER.getAddress();
    GUARDIANADDR = await GUARDIANSIGNER.getAddress();
    NEWOWNERADDR = await NEWOWNERSIGNER.getAddress();

  });

  describe("SafeNFT - Guardian Release", function () {

    it("Create New Unsafe NFT", async function () {
      const DummyNFT = await ethers.getContractFactory("DummyNFT");

      dummyNFT = await DummyNFT.deploy("Dummy NFT", "DUMMY");
    });

    it("Create Safe NFT", async function () {
      const SafeNFT = await ethers.getContractFactory("SafeNFT")
      safeNFTContract = await SafeNFT.deploy(dummyNFT.address, ASSET_ID, GUARDIANADDR, "Safe NFT", "SAFENFT");
    });

    it("Transfer to the Safe", async function () {
      await dummyNFT.functions['safeTransferFrom(address,address,uint256,bytes)'](DEPLOYERADDR, safeNFTContract.address, 1, '0x');
    });

    it('Owner of the DummyNFT is now the SafeNFT', async function() {
      const dummyNFTOwner = await dummyNFT.functions['ownerOf(uint256)'](1);
      expect(dummyNFTOwner[0]).to.equal(safeNFTContract.address);
    })


    it('release the nft back to the guardian', async function() {
      await safeNFTContract.connect(GUARDIANSIGNER).functions['releaseToAddress(address)'](GUARDIANADDR)
      const dummyNFTOwner = await dummyNFT.functions['ownerOf(uint256)'](1);
      expect(await safeNFTContract.provider.getCode(safeNFTContract.address)).to.equal('0x');
      expect(dummyNFTOwner[0]).to.equal(GUARDIANADDR);
    })

  });
  describe("SafeNFT - Guardian Revoke - Owner Release", function () {

    it("Create New Unsafe NFT", async function () {
      const DummyNFT = await ethers.getContractFactory("DummyNFT");

      dummyNFT = await DummyNFT.deploy("Dummy NFT", "DUMMY");
    });

    it("Create Safe NFT", async function () {
      const SafeNFT = await ethers.getContractFactory("SafeNFT")
      safeNFTContract = await SafeNFT.deploy(dummyNFT.address, 1, GUARDIANADDR, "Safe NFT", "SAFENFT");
    });

    it("Transfer to the Safe", async function () {
      await dummyNFT.functions['safeTransferFrom(address,address,uint256,bytes)'](DEPLOYERADDR, safeNFTContract.address, 1, '0x');
    });

    it('Owner of the DummyNFT is now the SafeNFT', async function() {
      const dummyNFTOwner = await dummyNFT.functions['ownerOf(uint256)'](1);
      expect(dummyNFTOwner[0]).to.equal(safeNFTContract.address);
    })

    it('Revoke Guardian', async function() {
      await safeNFTContract.connect(GUARDIANSIGNER).functions['revokeGuardian()']();
      const newGuardian = await safeNFTContract.functions['guardian()']();
      expect(newGuardian).to.not.equal(GUARDIANADDR);
    })

    it('release the nft back to the owner', async function() {
      await safeNFTContract.functions['releaseToOwner(bytes)']('0x')
      const dummyNFTOwner = await dummyNFT.functions['ownerOf(uint256)'](1);
      expect(await safeNFTContract.provider.getCode(safeNFTContract.address)).to.equal('0x');
      expect(dummyNFTOwner[0]).to.equal(DEPLOYERADDR);
    })

  });
});
