const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Verifiable Rental Protocol contracts...");

  // Get the ContractFactory and Signers here.
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy VerifiableRental contract
  // For MVP, we'll use a mock verifier address
  const mockVerifierAddress = deployer.address; // In production, this would be the KRNL verifier

  const VerifiableRental = await ethers.getContractFactory("VerifiableRental");
  const verifiableRental = await VerifiableRental.deploy(mockVerifierAddress);

  await verifiableRental.deployed();

  console.log("VerifiableRental deployed to:", verifiableRental.address);

  // Set up some initial properties for testing
  console.log("Setting up initial properties...");

  // Property IDs: 1, 2, 3
  await verifiableRental.setPropertyAvailability(1, true); // Seaside Villa
  await verifiableRental.setPropertyAvailability(2, true); // Mountain Cabin
  await verifiableRental.setPropertyAvailability(3, true); // Urban Loft

  console.log("Initial properties configured");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    verifiableRental: verifiableRental.address,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  console.log("Deployment completed!");
  console.log("Contract addresses:");
  console.log("- VerifiableRental:", verifiableRental.address);

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
