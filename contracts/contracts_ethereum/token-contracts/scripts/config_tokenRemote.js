
const { ethers } = require("hardhat");
const Config = require("../hardhat.config");
const TokenRemoteSc = require("../artifacts/contracts/Token3643Remote.sol/Token3643Remote.json");

const LOCAL_TOKENREMOTE_SCADDRESS = "0xbBC41A516b735Ff86bC5565239B65c929C8944cD";
const PEER_CHAINID = 2147484614;
const PEER_TOKENHOME = "0x4edB9D4ba0042926946a842E8d2dbB37edc9C677";


class TokenRemoteUtil {

    constructor(signer, scaddr) {
        this.nodeUrl = Config.networks.sepolia.url;
        this.abi = TokenRemoteSc.abi;
        this.scaddr = scaddr;
        this.signer = signer;
        this.provider = new ethers.JsonRpcProvider(this.nodeUrl);
        this.sc = new ethers.Contract(scaddr, this.abi, this.provider);
    }
    
    async configPeerTokenHome(peerChainId, remoteToken) {
      
        const scAbi = TokenRemoteSc.abi;
        const iface = new ethers.Interface(scAbi);
        const fragment = iface.getFunction("setTrustedRemotes");
        if (!fragment) {
          console.log("\n\n...Fragment not found!");
        } else {
          const data = iface.encodeFunctionData(fragment, [[PEER_CHAINID], [PEER_TOKENHOME], [true]]);
          console.log("Encoded data:", data);
        }

        const [owner] = await ethers.getSigners();
        const tokenRemoteSc = await ethers.getContractFactory("Token3643Remote");  // 自动加载 ABI
        const tokenRemoteScInst = await tokenRemoteSc.attach(LOCAL_TOKENREMOTE_SCADDRESS);

        // 调用函数
        try {
          const tx = await tokenRemoteScInst.setTrustedRemotes([peerChainId], [remoteToken], [true]);
          await tx.wait();
          console.log("setTrustedRemotes Success:", await tx.hash);
        } catch (error) {
          console.error("Error:", error.message);  // 检查详细错误
        }

    }

    async checkTrustAddress (chainid, from) {
        let ret = await this.sc.trustedRemotes(chainid, from);
        console.log('\n\n...checkTrustAddress...ret:', ret);
    }

}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("ConfigPeerTokenHome with the account:", deployer.address);

  let localTokenRemoteScUtil = new TokenRemoteUtil(deployer, LOCAL_TOKENREMOTE_SCADDRESS);
  
  await localTokenRemoteScUtil.configPeerTokenHome(PEER_CHAINID, PEER_TOKENHOME);
  await localTokenRemoteScUtil.checkTrustAddress(PEER_CHAINID, PEER_TOKENHOME);

   
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
