// scripts/deploy.js

const OWNER_ADDRESS = '0x2aefeecc53c18b231ea92b5f0772bd85272f8770';
const BIP44_CHAINID = 11155111;  //local network chainID

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  let LogicContractName = 'MultiSigVerifier';
  let initializeParams = [
    [OWNER_ADDRESS,
    "0x2aefeecc53c18b231ea92b5f0772bd85272f8770",
    "0x57e578b4bf11c89660115a52ff5fffa9c21556fa",
    "0x77528a0b79c0f419ad27449a39a654a466825e81"
    ],
    2,
  ]

  // Deploy logic contract
  let Logic = await ethers.getContractFactory(LogicContractName);

  let logic = await Logic.deploy(...initializeParams);
  await logic.waitForDeployment();
  console.log(LogicContractName, "address:", logic.target);

  LogicContractName = 'WmbGateway';
  initializeParams = [
    OWNER_ADDRESS,
    BIP44_CHAINID,
    logic.target,
  ]

  // Deploy logic contract
  Logic = await ethers.getContractFactory(LogicContractName);

  logic = await Logic.deploy();
  await logic.waitForDeployment();
  console.log(LogicContractName, "Logic address:", logic.target);

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
  console.log("ProxyAdmin address:", proxyAdminAddress);

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
