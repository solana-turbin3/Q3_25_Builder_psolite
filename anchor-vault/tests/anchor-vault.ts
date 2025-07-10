import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorVault } from "../target/types/anchor_vault";

describe("anchor-vault", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.anchorVault as Program<AnchorVault>;

  const user = anchor.AnchorProvider.local().wallet;
  
  const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), user.publicKey.toBuffer()],
    program.programId
  );

  const [statePda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("state"), user.publicKey.toBuffer()],
    program.programId
  );

  it("Is initialized!", async () => {

    const tx = await program.methods.initialize().accountsStrict({
      vaultState: statePda,
      vault: vaultPda,
      user: user.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();

    console.log("Your transaction signature", tx);

  });

  it("Deposit funds!", async () => {
    const depositAmount = new anchor.BN(10000000); // 10 SOL in lamports

    const tx = await program.methods.deposit(depositAmount).accountsStrict({
      vaultState: statePda,
      vault: vaultPda,
      user: user.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();

    console.log("Your transaction signature for deposit", tx);
  });

  it("Withdraw funds!", async () => {
    const withdrawAmount = new anchor.BN(5000000); // 5 SOL in lamports

    const tx = await program.methods.withdraw(withdrawAmount).accountsStrict({
      vaultState: statePda,
      vault: vaultPda,
      user: user.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();

    console.log("Your transaction signature for withdrawal", tx);
  });

  it("Close vault!", async () => {
    const tx = await program.methods.close().accountsStrict({
      vaultState: statePda,
      vault: vaultPda,
      user: user.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();

    console.log("Your transaction signature for closing the vault", tx);
  });
});
