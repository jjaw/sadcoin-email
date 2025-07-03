// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/SADCoin.sol";
import "../src/FEELS.sol";
import "../src/StakingContract.sol";
import "../src/GameRewards.sol";
import "../src/ConversionContract.sol";
import "../src/NFTClaim.sol";

/// @notice Deployment script for Sepolia testnet with VRF v2.5
contract DeploySepoliaScript is Script {
    // Sepolia testnet VRF v2.5 addresses
    address constant SEPOLIA_VRF_COORDINATOR = 0x5CE8D5A2BC84beb22a398CCA51996F7930313D61;
    address constant SEPOLIA_ETH_USD_FEED = 0x694AA1769357215DE4FAC081bf1f309aDC325306;
    address constant SEPOLIA_LINK_TOKEN = 0xb1D4538B4571d411F07960EF2838Ce337FE1E80E;
    bytes32 constant SEPOLIA_KEY_HASH = 0x1770bdc7eec7771f7ba4ffd640f34260d7f095b79c92d34a5b2551d6f6cfd2be;
    
    // Chainlink Functions (update with actual Sepolia addresses when available)
    address constant FUNCTIONS_ROUTER = address(0x649A2DA509887A4C4a049c16e15a3952E8E8b60D); // Sepolia Functions Router
    bytes32 constant DON_ID = keccak256("fun_ethereum_sepolia_1");
    
    // VRF Subscription ID (update with your actual subscription)
    uint256 constant VRF_SUBSCRIPTION_ID = 112471577075721091854264773675545125245900460458976497301714233269987091787170; // Update with actual subscription ID
    
    function run() external {
        address deployer = msg.sender;
        
        console.log("Deploying SadCoin ecosystem to Sepolia testnet...");
        console.log("Deployer:", deployer);
        console.log("Deployer balance:", deployer.balance);
        
        require(block.chainid == 11155111, "This script is for Sepolia testnet only");
        require(deployer.balance >= 0.1 ether, "Insufficient ETH for deployment");
        
        vm.startBroadcast();
        
        // Step 1: Deploy the token contracts first
        console.log("\\n=== Deploying Token Contracts ===");
        
        SADCoin sadCoin = new SADCoin();
        console.log("SADCoin deployed at:", address(sadCoin));
        
        FEELS feels = new FEELS();
        console.log("FEELS deployed at:", address(feels));
        
        // Step 2: Deploy the staking contract
        console.log("\\n=== Deploying Staking Contract ===");
        
        StakingContract staking = new StakingContract(
            address(sadCoin),
            address(feels)
        );
        console.log("StakingContract deployed at:", address(staking));
        
        // Step 3: Deploy the game rewards contract
        console.log("\\n=== Deploying Game Rewards Contract ===");
        
        GameRewards gameRewards = new GameRewards(
            SEPOLIA_VRF_COORDINATOR,
            address(feels),
            SEPOLIA_KEY_HASH,
            VRF_SUBSCRIPTION_ID
        );
        console.log("GameRewards deployed at:", address(gameRewards));
        
        // Step 4: Deploy the conversion contract
        console.log("\\n=== Deploying Conversion Contract ===");
        
        ConversionContract conversion = new ConversionContract(
            address(sadCoin),
            address(feels),
            SEPOLIA_ETH_USD_FEED,
            SEPOLIA_VRF_COORDINATOR,
            SEPOLIA_KEY_HASH,
            VRF_SUBSCRIPTION_ID
        );
        console.log("ConversionContract deployed at:", address(conversion));
        
        // Step 5: Deploy the NFT claim contract
        console.log("\\n=== Deploying NFT Claim Contract ===");
        
        NFTClaim nftClaim = new NFTClaim(
            FUNCTIONS_ROUTER,
            DON_ID
        );
        console.log("NFTClaim deployed at:", address(nftClaim));
        
        // Step 6: Set up permissions and roles
        console.log("\\n=== Setting Up Permissions ===");
        
        // Grant FEELS minting rights to contracts
        feels.grantRole(feels.MINTER_ROLE(), address(staking));
        feels.grantRole(feels.MINTER_ROLE(), address(gameRewards));
        console.log("Granted FEELS minter role to StakingContract and GameRewards");
        
        feels.grantRole(feels.BURNER_ROLE(), address(conversion));
        feels.grantRole(feels.BURNER_ROLE(), address(gameRewards));
        console.log("Granted FEELS burner role to ConversionContract and GameRewards");
        
        // Grant SADCoin minting rights to conversion contract
        sadCoin.addSadMinter(address(conversion));
        console.log("Added ConversionContract as SADCoin minter");
        
        // Step 7: Initial configuration
        console.log("\\n=== Initial Configuration ===");
        
        // Mint some initial SADCoin to deployer for testing
        uint256 initialMint = 10000 * 10**18; // 10,000 SAD
        sadCoin.mintSadness(deployer, initialMint);
        console.log("Minted", initialMint / 10**18, "SAD to deployer for testing");
        
        vm.stopBroadcast();
        
        // Step 8: Log deployment summary
        console.log("\\n=== SEPOLIA DEPLOYMENT SUMMARY ===");
        console.log("Network: Sepolia Testnet (Chain ID: 11155111)");
        console.log("Deployer:", deployer);
        console.log("SADCoin:", address(sadCoin));
        console.log("FEELS:", address(feels));
        console.log("StakingContract:", address(staking));
        console.log("GameRewards:", address(gameRewards));
        console.log("ConversionContract:", address(conversion));
        console.log("NFTClaim:", address(nftClaim));
        
        console.log("\\n=== CHAINLINK VRF v2.5 CONFIGURATION ===");
        console.log("VRF Coordinator:", SEPOLIA_VRF_COORDINATOR);
        console.log("Key Hash:", vm.toString(SEPOLIA_KEY_HASH));
        console.log("Subscription ID:", VRF_SUBSCRIPTION_ID);
        console.log("LINK Token:", SEPOLIA_LINK_TOKEN);
        
        console.log("\\n=== NEXT STEPS ===");
        console.log("1. Create VRF v2.5 subscription at:");
        console.log("   https://vrf.chain.link/sepolia");
        console.log("2. Add these contracts as consumers:");
        console.log("   - GameRewards:", address(gameRewards));
        console.log("   - ConversionContract:", address(conversion));
        console.log("3. Fund subscription with LINK tokens");
        console.log("4. Set up Chainlink Automation for:");
        console.log("   - StakingContract (reward distribution)");
        console.log("   - ConversionContract (daily rate updates)");
        console.log("5. Configure Chainlink Functions for NFTClaim");
        console.log("6. Verify contracts on Etherscan");
        console.log("7. Test all functionality");
        
        console.log("\\n Sepolia deployment completed! Ready for sad testing!");
    }
}