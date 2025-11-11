// scripts/deploy.js

const OWNER_ADDRESS = '0x2aefeecc53c18b231ea92b5f0772bd85272f8770';
const GATEWAY_ADDRESS = '0x94Ba3Afc22f98C37e8d05F748DD2C928183d1d3C';
const PEER_TOKENHOME_ADDRESS = "0x4edB9D4ba0042926946a842E8d2dbB37edc9C677"; // peer HomeToken Contract Address
const PEER_TOKENHOME_CHAINID = 2147484614; // peer chain id
const LOCAL_MAPPINGTOKEN_ADDRESS = '0x3ab51A08e69d661cC96379C637904b66e97328D7'; // ERC20/3643 token address


async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const LogicContractName = 'Token3643Remote';
  const initializeParams = [
    OWNER_ADDRESS,
    GATEWAY_ADDRESS,
    LOCAL_MAPPINGTOKEN_ADDRESS,
    PEER_TOKENHOME_ADDRESS,
    PEER_TOKENHOME_CHAINID
  ]
  
  // Deploy logic contract
  const Logic = await ethers.getContractFactory(LogicContractName);

  const logic = await Logic.deploy();
  await logic.waitForDeployment();
  // console.log(LogicContractName, "Logic address:", logic.target);

  // Deploy proxy contract
  const Proxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
  const proxy = await Proxy.deploy(
    logic.target,
    OWNER_ADDRESS,
    logic.interface.encodeFunctionData("initialize", initializeParams)
  );
  await proxy.waitForDeployment();

  // Get proxyAdmin address from the deployment transaction
  const receipt = await proxy.deploymentTransaction().wait();
  const logs = receipt.logs;
  const proxyAdminLog = logs.find((log) => proxy.interface.parseLog(log)?.name === 'AdminChanged');
  const proxyAdminAddress = proxyAdminLog.args[1];
  // console.log("ProxyAdmin address:", proxyAdminAddress);

  const executor = Logic.attach(proxy.target);
  console.log(LogicContractName, "address:", executor.target);

  console.log("Contract deployed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
