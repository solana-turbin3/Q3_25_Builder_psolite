# Overview - Anchor AMM

This project implements an AMM program on the Solana blockchain using the Anchor framework. The Program Allow User to create a Liquidity Pool by providing to SPL token (e.g BONK and USDC), so anyone can swap in the pool.

## Usage

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