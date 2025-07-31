
## Development Commands

### Frontend (sad-email-frontend/)
```bash
npm run dev          # Start development server with turbopack
npm run build        # Build for production
npm run lint         # Run ESLint
npm run start        # Start production server
npm test             # Run tests (currently placeholder)
```

## Architecture Overview

### Monorepo Structure
- `sad-email-frontend/` - Next.js 14 React application with TypeScript
- `contracts-immense-pool-of-sadness/` - Foundry-based Solidity smart contracts

### Multi-Network Support
**Primary Network**: Avalanche Fuji (Chain ID: 43113)
**Fallback Network**: Ethereum Sepolia (Chain ID: 11155111)

Contracts are deployed identically on both networks with automatic failover.

### Core Smart Contracts
- **SADCoin** (`src/SADCoin.sol`) - ERC-20 token tracking sadness levels
- **FEELS** (`src/FEELS.sol`) - Emotional rewards token with damage tracking  
- **StakingContract** (`src/StakingContract.sol`) - Stake SAD to earn FEELS (42/hour)
- **GameRewards** (`src/GameRewards.sol`) - VRF-powered random rewards
- **ConversionContract** (`src/ConversionContract.sol`) - Token swaps with Chainlink price feeds
- **NFTClaim** (`src/NFTClaim.sol`) - Achievement NFTs for email milestones

### AI Integration Architecture

**AWS Bedrock Multi-Model System** (`src/lib/bedrock.ts`)
- Officer: Claude 3.5 Sonnet (authoritative responses)
- Agent: Claude 3 Haiku (efficient detailed communications)  
- Monkey: Llama 3.1 70B (creative chaos)

**Email Generation Flow**:
1. User input captured in game screens
2. Persona-specific prompts loaded from `public/prompt/`
3. Multi-provider API route (`src/app/api/generate-email/route.ts`) handles Bedrock + Gemini fallback
4. JSON response parsed and formatted for email output

### Game State Management

**Game States** (`src/types/game.ts`):
`boot` → `login` → `character-select` → `mini-game` → `writing` → `sent`

**Character Archetypes**: officer, agent, monkey, intern

### Key Frontend Components

**Screen Components** (`src/components/screens/`):
- Game flow managed through screen transitions
- Each character has unique mini-game mechanics
- CRT terminal aesthetic with intentionally buggy interactions

**Contract Integration** (`src/lib/contracts.ts`):
- Network-aware contract address mapping
- Comprehensive ABIs for all contract interactions
- Multi-chain support with automatic network detection

## Chainlink Integrations

1. **Price Feeds** - ETH/USD conversion for SAD token purchases
2. **VRF** - Random reward multipliers in mini-games and daily conversion rates  
3. **Automation** - Automated FEELS generation and reward distribution
4. **Functions** - Email verification for NFT achievements (planned)

