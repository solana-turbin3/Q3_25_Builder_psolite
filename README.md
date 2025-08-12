# 🔥 Turbin3 Q3 2025 Builder Cohort

Demonstrating advanced Solana blockchain capabilities through:
- **Secure Anchor programs** (AMMs, Escrows, Vaults, NFT Marketplaces , NFT Staking)
- **Program Derived Addresses (PDAs)**
- **Token & NFT operations**
- **DeFi protocols**
- **Rust/TypeScript best practices**

![Turbine Banner](https://pbs.twimg.com/profile_banners/1707159181914976256/1748632505/1500x500)

## 📂 Project Structure

```markdown
├── README.md
├── anchor-amm/                     # Automated Market Maker program
│   ├── programs/anchor-amm/         # Swap, deposit, withdraw functionality
│   ├── tests/                       # TypeScript tests

│
├── anchor-escrow/                  # Anchor-based escrow program
│   ├── programs/anchor-escrow/      # Make/take/refund escrows
│   ├── tests/                       # TypeScript tests

│
├── anchor-marketplace/             # NFT Marketplace program
│   ├── programs/anchor-marketplace/ # List/delist/purchase NFTs
│   ├── tests/                       # TypeScript tests

│
├── anchor-vault/                   # Anchor-based vault program
│   ├── programs/anchor-vault/       # Token vault operations
│   ├── tests/                       # TypeScript tests

│
├── capstone-pegging-factory/       # Advanced pegging protocol
│   ├── programs/                    # Platform/project pegging operations
│   ├── tests/                       # Comprehensive test suite
│
├── nft-staking/                    # NFT Staking program
│   ├── programs/nft-staking/        # Stake/unstake NFTs
│   ├── tests/                       # TypeScript tests

│
└── solana-starter/                 # Solana starter toolkit
    ├── rs/                          # Rust programs and utilities
    ├── ts/                          # TypeScript scripts and tools
    │   ├── cluster1/                # Mainnet/testnet operations
    │   ├── prereqs/                 # Prerequisite setup scripts
    │   └── programs/                # Program interactions
    └── images/                      # Project images
```

## Projects

### 1. Solana Starter
A collection of starter scripts and utilities for Solana development. Includes:
- Rust programs
- TypeScript interaction scripts
- Wallet management tools
- SPL token operations
- NFT operations

[View Details](./solana-starter/README.md)
### 2. Anchor Escrow
A secure escrow program built with Anchor framework. Features:
- Make escrow offers
- Take escrow offers
- Secure state management

[View Details](./anchor-escrow/README.md)

### 3. Anchor Vault
A token vault program built with Anchor framework. Features:
- Token deposits
- Secure withdrawals
- Account management

[View Details](./anchor-vault/README.md)

### 4. NFT Staking
Reward-bearing staking program with:
- NFT locking
- Reward calculation
- Configurable periods

[View Details](./nft-staking/README.md)

### 5. Anchor AMM
Automated Market Maker program with:
- Token swaps
- Liquidity provision
- Pool management

[View Details](./anchor-amm/README.md)

### 6. Anchor Marketplace
NFT Marketplace with:
- Listing management
- Secure purchases
- Royalty support

[View Details](./anchor-marketplace/README.md)

### 7. Pegging factory (IronPeg)
CapStone that I built from what I learnt:
- Cross-platform pegging
- Yield distribution
- Fee claiming

[View Details](https://github.com/psolite/capstone-pegging-factory)


## Getting Started

1. Clone the repository:
```bash
git clone <repo url>
```

2. Install dependencies in each project directory:
```bash
cd anchor-escrow && npm install
```

3. Build and test programs:
```bash
anchor build
anchor test
```

## Requirements
- Rust 1.88.0
- Solana CLI 2.2.20
- Node.js 24.3.0
- Yarn or npm
- Anchor 0.31.1

## 📬 Contact

**You can reach through the following means**  
✉️ [0xpsolitesol@gmail.com](mailto:0xpsolitesol@gmail.com)  
🐦 [@0xpsolitesol](https://twitter.com/0xpsolitesol) on X (twitter)

_This submission represents my own work in accordance with academic integrity policies._
