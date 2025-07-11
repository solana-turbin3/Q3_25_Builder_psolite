import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorEscrow } from "../target/types/anchor_escrow";

import takerwallet from "/home/xpsolitesol/Turbin3/Q3_25_Builder_psolite/anchor-escrow/PsWBmRKR837uz18mG2Udx2bkxBSzfUkw8kQbp927m4L.json";
import makerwallet from "/home/xpsolitesol/Turbin3/turbin3-wallet.json";
import { createMint, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

describe("anchor-escrow", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.anchorEscrow as Program<AnchorEscrow>;
  const connection = anchor.AnchorProvider.env().connection;

  const takerKeypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(takerwallet));
  const makerKeypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(makerwallet));

  let mintA: anchor.web3.PublicKey;
  let mintB: anchor.web3.PublicKey;
  let makerAtaA: anchor.web3.PublicKey;
  let makerAtaB: anchor.web3.PublicKey;
  let takerAtaA: anchor.web3.PublicKey;
  let takerAtaB: anchor.web3.PublicKey;
  let escrow: anchor.web3.PublicKey;
  let vault: anchor.web3.PublicKey;




  const seed = new anchor.BN(41); // Unique seed for the escrow
  const receive = new anchor.BN(20000 * Math.pow(10, 9)); // Amount of Mint B tokens to receive in the escrow
  const deposit = new anchor.BN(10000 * Math.pow(10, 9)); // Amount of Mint A tokens to deposit in the escrow

  before(async () => {

    // Create Mint A
    mintA = await createMint(
      anchor.AnchorProvider.env().connection,
      makerKeypair,
      makerKeypair.publicKey,
      null,
      9
    );

    console.log("Mint A created:", mintA.toBase58());

    // Create Mint B
    mintB = await createMint(
      anchor.AnchorProvider.env().connection,
      makerKeypair,
      makerKeypair.publicKey,
      null,
      9
    );

    console.log("Mint B created:", mintB.toBase58());

    // Create an ATA for Maker Mint A
    makerAtaA = (await getOrCreateAssociatedTokenAccount(
      connection,
      makerKeypair,
      mintA,
      makerKeypair.publicKey
    )).address;

    console.log(`ATA for Maker Mint A is: ${makerAtaA.toBase58()}`);

    // Mint to Maker makerAtaA
    const mintTx = await mintTo(
      connection,
      makerKeypair,
      mintA,
      makerAtaA,
      makerKeypair.publicKey,
      1000000 * Math.pow(10, 9)
    );
    console.log(`Your mint txid: ${mintTx}`);

    // Create an ATA for Maker Mint B
    makerAtaB = (await getOrCreateAssociatedTokenAccount(
      connection,
      makerKeypair,
      mintB,
      makerKeypair.publicKey
    )).address;
    console.log(`ATA for Maker Mint B is: ${makerAtaB.toBase58()}`);

    // Create an ATA for Taker Mint A
    takerAtaA = (await getOrCreateAssociatedTokenAccount(
      connection,
      takerKeypair,
      mintA,
      takerKeypair.publicKey
    )).address;
    console.log(`ATA for Taker Mint A is: ${takerAtaA.toBase58()}`);

    // Create an ATA for Taker Mint B
    takerAtaB = (await getOrCreateAssociatedTokenAccount(
      connection,
      takerKeypair,
      mintB,
      takerKeypair.publicKey
    )).address;
    console.log(`ATA for Taker Mint B is: ${takerAtaB.toBase58()}`);

    // Mint to ATA for Taker Mint B
    const mintTxB = await mintTo(
      connection,
      makerKeypair,
      mintB,
      takerAtaB,
      makerKeypair.publicKey,
      1000000 * Math.pow(10, 9) 
    );

    console.log(`Your mint txid for Mint B: ${mintTxB}`);

    // Create associated token accounts for maker for Mint A
    makerAtaA = anchor.utils.token.associatedAddress({
      mint: mintA,
      owner: makerKeypair.publicKey,
    });

    // Create associated token accounts for maker for Mint B
    makerAtaB = anchor.utils.token.associatedAddress({
      mint: mintB,
      owner: makerKeypair.publicKey,
    });


    const seedBuffer = Buffer.alloc(8);
    seedBuffer.writeBigUInt64LE(BigInt(seed.toNumber()));

    // Find the escrow PDA
    [escrow] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), makerKeypair.publicKey.toBuffer(), seedBuffer],
      program.programId
    );

    // Escrow ATA for Mint A
    vault = await getAssociatedTokenAddress(
      mintA,
      escrow,
      true
    )

  });


  it("Initialize Escrow!", async () => {
    // Add your test here.
    const tx = await program.methods.make(seed, receive, deposit).accountsStrict({
      maker: makerKeypair.publicKey,
      mintA,
      mintB,
      makerAtaA,
      makerAtaB,
      vault,
      escrow,
      systemProgram: anchor.web3.SystemProgram.programId,
      associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
    }).rpc();

    console.log("Your transaction signature", tx);
  });

  // If you want to test the taker functionality, uncomment the below code block, 
  // and comment the refund functionality (because the refund will fail due to taker function closes the escrow).
  
  // it("Withdraw and Close Escrow for the taker!", async () => {
  //   // Add your test here.
  //   const tx = await program.methods.take().accountsStrict({
  //     maker: makerKeypair.publicKey,
  //     taker: takerKeypair.publicKey,
  //     mintA,
  //     mintB,
  //     makerAtaB,
  //     takerAtaA,
  //     takerAtaB,
  //     vault,
  //     escrow,
  //     systemProgram: anchor.web3.SystemProgram.programId,
  //     associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
  //     tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
  //   }).signers([takerKeypair])
  //   .rpc();

  //   console.log("Your transaction signature", tx);
  // });

  it("Withdraw and Close Escrow to Refund!", async () => {
    // Add your test here.
    const tx = await program.methods.refund().accountsStrict({
      maker: makerKeypair.publicKey,
      mintA,
      mintB,
      makerAtaA,
      vault,
      escrow,
      systemProgram: anchor.web3.SystemProgram.programId,
      associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
    }).rpc();

    console.log("Your transaction signature", tx);
  });
});
