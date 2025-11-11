
const { ethers } = require("hardhat");
const Config = require("../hardhat.config");
const TokenHomeSc = require("../artifacts/contracts/Token3643Home.sol/Token3643Home.json");

const PEER_CHAINID = 11155111; 
const PEER_TOKENREMOTE = "0xbBC41A516b735Ff86bC5565239B65c929C8944cD";
const LOCAL_TOKENHOME_SCADDRESS = "0x4edB9D4ba0042926946a842E8d2dbB37edc9C677";

class TokenHomeUtil {

    constructor(signer, scaddr) {
        this.nodeUrl = Config.networks.polygonAmoy.url;
        this.abi = TokenHomeSc.abi;
        this.scaddr = scaddr;
        this.signer = signer;
        this.provider = new ethers.JsonRpcProvider(this.nodeUrl);
        this.sc = new ethers.Contract(scaddr, this.abi, this.provider);
    }
    
    async configTokenRemote(peerRemoteChainID, peerTokenRemote) {      
        // const scAbi = TokenHomeSc.abi;
        // const iface = new ethers.Interface(scAbi);
        // const fragment = iface.getFunction("configTokenRemote");
        // if (!fragment) {
        //   console.log("\n\n...Fragment not found!");
        // } else {
        //   const data = iface.encodeFunctionData(fragment, [11155111, "0x62cc6fE8685533311B4f4032a9Cc0681B54fB917"]);
        //   console.log("Encoded data:", data);
        // }

        // const [owner] = await ethers.getSigners();
        //   console.log("\n\n...getSigners!");
        // const tokenHomeSc = await ethers.getContractFactory("Token3643Home");  // 自动加载 ABI
        //   console.log("\n\n...load abi!");
        // const tokenHomeScInst = await tokenHomeSc.attach(TokenHomeScAddress);
        //   console.log("\n\n...to generate instance!");
        // await tokenHomeScInst.waitForDeployment();

        // // 调用函数
        // try {
        //   console.log("\n\n...to config peerTokenRemote: ", peerRemoteChainID, peerTokenRemote);
        //   const tx = await tokenHomeScInst.configTokenRemote(peerRemoteChainID, peerTokenRemote);
        //   console.log("\n\n...config peerTokenRemote done!");
        //   await tx.wait();
        //   console.log("Success:", await tx.hash);
        // } catch (error) {
        //   console.error("Error:", error.message);  // 检查详细错误
        // }
                
        let signedSc = this.sc.connect(this.signer);
        // console.log("\n\n...signedSc: ", signedSc);
        let tx = await signedSc.configTokenRemote(peerRemoteChainID, peerTokenRemote);
        // console.log("\n\n...signedSc: ", signedSc);
        let ret = await tx.wait();
        console.log("\n\n...configTokenRemote...ret:", tx.hash, ret);
    }

    async checkTrustAddress (chainid, from) {
        let ret = await this.sc.trustedRemotes(chainid, from);
        console.log('\n\n...checkTrustAddress...ret:', ret);
    }

}

async function main() {

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  let localTokenHomeScUtil = new TokenHomeUtil(deployer, LOCAL_TOKENHOME_SCADDRESS);

  await localTokenHomeScUtil.configTokenRemote(PEER_CHAINID, PEER_TOKENREMOTE);
  await localTokenHomeScUtil.checkTrustAddress(PEER_CHAINID, PEER_TOKENREMOTE);

   
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
