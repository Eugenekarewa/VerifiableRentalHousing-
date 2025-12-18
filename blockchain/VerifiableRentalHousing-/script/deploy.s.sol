// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {VerifiableRental} from "../src/SmartContract.sol";

contract DeployVerifiableRental is Script {
    address public verifierAddress = 0xF2Ea67F83b58225edF11F3Af4A5733B3E0844509;
    address public delegatedAccount = 0x9969827E2CB0582e08787B23F641b49Ca82bc774;
    
    function run() public returns (VerifiableRental) {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        string memory sepoliaRpcUrl = vm.envString("SEPOLIA_RPC_URL");
        
        // Set up RPC URL for broadcasting
        vm.createSelectFork(sepoliaRpcUrl);
        
        console.log("Starting deployment...");
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
        console.log("Verifier address:", verifierAddress);
        console.log("Delegated account:", delegatedAccount);
        console.log("RPC URL:", sepoliaRpcUrl);
        
        // Start broadcasting
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the contract
        VerifiableRental verifiableRental = new VerifiableRental(verifierAddress);
        
        vm.stopBroadcast();
        
        // Log deployment information
        console.log("========================================");
        console.log(unicode"✅ VerifiableRental successfully deployed!"); // Fixed line
        console.log("Contract address:", address(verifiableRental));
        console.log("Owner:", verifiableRental.owner());
        console.log("Verifier:", verifiableRental.verifier());
        console.log("========================================");
        
        // Verify ownership is deployer
        address actualOwner = verifiableRental.owner();
        require(actualOwner == vm.addr(deployerPrivateKey), "Owner mismatch");
        
        // Verify verifier is set correctly
        address actualVerifier = verifiableRental.verifier();
        require(actualVerifier == verifierAddress, "Verifier mismatch");
        
        return verifiableRental;
    }
}