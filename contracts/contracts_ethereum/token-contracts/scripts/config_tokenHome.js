
const { ethers } = require("hardhat");
const Config = require("../hardhat.config");
const TokenHomeSc = require("../artifacts/contracts/Token3643Home.sol/Token3643Home.json");

const PEER_CHAINID = 2147484614;
const PEER_TOKENREMOTE = "0x5991A20A11A6bd359F428aA776506dF22615EFa1";
const LOCAL_TOKENHOME_SCADDRESS = "0x398940dACa3b3Ab9c66f611ad596462f45397698";

class TokenHomeUtil {

    constructor(signer, scaddr) {
        this.nodeUrl = Config.networks.sepolia.url;
        this.abi = TokenHomeSc.abi;
        this.scaddr = scaddr;
        this.signer = signer;
        this.provider = new ethers.JsonRpcProvider(this.nodeUrl);
        this.sc = new ethers.Contract(scaddr, this.abi, this.provider);
    }
    
    async configTokenRemote(peerRemoteChainId, peerTokenRemote) {
      
        // const scAbi = TokenHomeSc.abi;
        // const iface = new ethers.Interface(scAbi);
        // const fragment = iface.getFunction("configTokenRemote");
        // if (!fragment) {
        //   console.log("\n\n...Fragment not found!");
        // } else {
        //   const data = iface.encodeFunctionData(fragment, [11155111, "0x81a1c9aeA719603B3Adc01DF87F8345bb4a26F04"]);
        //   console.log("Encoded data:", data);
        // }

        // const [owner] = await ethers.getSigners();
        // const tokenHomeSc = await ethers.getContractFactory("Token3643Home");  // 自动加载 ABI
        // const tokenHomeScInst = await tokenHomeSc.attach(TokenHomeScAddress);
        // await tokenHomeScInst.waitForDeployment();

        // // 调用函数
        // try {
        //   const tx = await tokenHomeScInst.configTokenRemote(peerRemoteChainId, peerTokenRemote);
        //   await tx.wait();
        //   console.log("Success:", await tx.hash);
        // } catch (error) {
        //   console.error("Error:", error.message);  // 检查详细错误
        // }
                
        let signedSc = this.sc.connect(this.signer);
        let tx = await signedSc.configTokenRemote(peerRemoteChainId, peerTokenRemote);
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
