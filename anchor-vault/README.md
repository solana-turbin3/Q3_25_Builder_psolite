# Overview - Anchor Vault

This project implements a vault program on the Solana blockchain using the Anchor framework. The vault allows users to initialize, deposit and withdraw SOL tokens securely, and also close their vault accounts.

## Usage
Start up a test validator:
```bash
solana-test-validator
```
Then run:

```bash
anchor build
anchor deploy
```
Once deployed, ensure the program is matches in programs/vault/lib.rs and Anchor.toml
Also ensure that your wallet it set in the Anchor.toml

```bash
anchor test --skip-test-validator
```