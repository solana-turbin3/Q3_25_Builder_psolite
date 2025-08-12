# Overview - NFT Staking

This project implements an NFT Staking program on the Solana blockchain using the Anchor framework. The Program Allow User to staking their Nft, Unstaking the NFT after a set time and enter point.

## Usage
Deploying this on Devnet due to Metaplex is not available on default on Local validator
 
```bash
anchor build
anchor deploy
```
Once deployed, 
Ensure you update the wallets of the user wallet in /tests/anchor-amm.ts
Also ensure that your wallet it set in the Anchor.toml

```bash
anchor test --skip-test-validator
```