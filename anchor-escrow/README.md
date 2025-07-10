# Overview - Anchor Escrow

This project implements a Escrow program on the Solana blockchain using the Anchor framework. The Escrow allows users to place an order (user can bring 10000 BONK (SPL Token) and want 100 USDC (another SPL token ) in exchange), then another user can match the order (by giving the user 100 USDC and Taking the 10000 BONK).

## Usage

```bash
anchor build
anchor deploy
```
Once deployed, 
Ensure you update the wallets of the taker and the maker in /tests/anchor-escrow.ts
Also ensure that your wallet it set in the Anchor.toml

```bash
anchor test --skip-test-validator
```