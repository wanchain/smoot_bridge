
const { ethers } = require("hardhat");

async function main() {
  const initialSupply = 1000000; // 初始发行量，例如 1,000,000 代币
  const MyToken = await ethers.getContractFactory("MyToken3643");
  const myToken = await MyToken.deploy(initialSupply);

  await myToken.waitForDeployment();
  console.log("MyToken address:", myToken.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
