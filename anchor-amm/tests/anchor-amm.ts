import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorAmm } from "../target/types/anchor_amm";
import wallet from "/home/xpsolitesol/Turbin3/turbin3-wallet.json";
import { createMint, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { assert } from "chai";

describe("anchor-amm", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.anchorAmm as Program<AnchorAmm>;

  const connection = anchor.AnchorProvider.env().connection;

  const keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(wallet));

  let mintX: anchor.web3.PublicKey;
  let mintY: anchor.web3.PublicKey;
  let userAtaX: anchor.web3.PublicKey;
  let userAtaY: anchor.web3.PublicKey;
  let vaultAtaX: anchor.web3.PublicKey;
  let vaultAtaY: anchor.web3.PublicKey;
  let mintLp: anchor.web3.PublicKey;
  let config: anchor.web3.PublicKey;
  let userAtaLp: anchor.web3.PublicKey;




  const seed = new anchor.BN(9); // Unique seed for the Config
  const fee = 1000; // Fee for the AMM
  const systemProgram = anchor.web3.SystemProgram.programId;
  const associatedTokenProgram = anchor.utils.token.ASSOCIATED_PROGRAM_ID;
  const tokenProgram = anchor.utils.token.TOKEN_PROGRAM_ID;


  before(async () => {

    // Create Mint X
    mintX = await createMint(
      connection,
      keypair,
      keypair.publicKey,
      null,
      9
    );

    console.log("Mint X created:", mintX.toBase58());

    // Create Mint Y
    mintY = await createMint(
      connection,
      keypair,
      keypair.publicKey,
      null,
      9
    );

    console.log("Mint Y created:", mintY.toBase58());

    // Create an ATA for User Mint X
    userAtaX = (await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mintX,
      keypair.publicKey
    )).address;

    console.log(`ATA for User Mint X is: ${userAtaX.toBase58()}`);

    // Mint to userAtaX
    const mintXTx = await mintTo(
      connection,
      keypair,
      mintX,
      userAtaX,
      keypair.publicKey,
      1000000 * Math.pow(10, 9)
    );
    console.log(`Your mint txid for 1000000 X Token: ${mintXTx}`);

    // Create an ATA for User Mint X
    userAtaY = (await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mintY,
      keypair.publicKey
    )).address;
    console.log(`ATA for User Mint X is: ${userAtaY.toBase58()}`);

    // Mint to userAtaY
    const mintYTx = await mintTo(
      connection,
      keypair,
      mintY,
      userAtaY,
      keypair.publicKey,
      1000000 * Math.pow(10, 9)
    );
    console.log(`Your mint txid for 1000000 Y Token: ${mintYTx}`);

    // // Create an ATA for Taker Mint A
    // takerAtaA = (await getOrCreateAssociatedTokenAccount(
    //   connection,
    //   takerKeypair,
    //   mintA,
    //   takerKeypair.publicKey
    // )).address;
    // console.log(`ATA for Taker Mint A is: ${takerAtaA.toBase58()}`);

    // // Create an ATA for Taker Mint B
    // takerAtaB = (await getOrCreateAssociatedTokenAccount(
    //   connection,
    //   takerKeypair,
    //   mintB,
    //   takerKeypair.publicKey
    // )).address;
    // console.log(`ATA for Taker Mint B is: ${takerAtaB.toBase58()}`);

    // // Mint to ATA for Taker Mint B
    // const mintTxB = await mintTo(
    //   connection,
    //   makerKeypair,
    //   mintB,
    //   takerAtaB,
    //   makerKeypair.publicKey,
    //   1000000 * Math.pow(10, 9) 
    // );

    // console.log(`Your mint txid for Mint B: ${mintTxB}`);

    // Create associated token accounts for maker for Mint A
    // vaultAtaX = anchor.utils.token.associatedAddress({
    //   mint: mintX,
    //   owner: config,
    // });

    // // Create associated token accounts for maker for Mint B
    // makerAtaB = anchor.utils.token.associatedAddress({
    //   mint: mintB,
    //   owner: makerKeypair.publicKey,
    // });


    const seedBuffer = Buffer.alloc(8);
    seedBuffer.writeBigUInt64LE(BigInt(seed.toNumber()));

    // Get the Config PDA
    [config] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("config"), seedBuffer],
      program.programId
    );

    // Get the Mint LP PDA
    [mintLp] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("lp"), config.toBuffer()],
      program.programId
    )

    userAtaLp = await getAssociatedTokenAddress(
      mintLp,
      keypair.publicKey
    )

    // Create associated token accounts for Vault for Mint X
    vaultAtaX = await getAssociatedTokenAddress(
      mintX,
      config,
      true
    );

    // Create associated token accounts for Vault for Mint Y
    vaultAtaY = await getAssociatedTokenAddress(
      mintY,
      config,
      true
    );

  });


  it("Is initialized!", async () => {

    const tx = await program.methods.initialize(seed, fee, keypair.publicKey)
      .accountsStrict({
        initializer: keypair.publicKey,
        mintX,
        mintY,
        mintLp,
        vaultX: vaultAtaX,
        vaultY: vaultAtaY,
        config,
        systemProgram,
        associatedTokenProgram,
        tokenProgram,
      }).signers([keypair]).rpc();

    console.log("Your transaction signature", tx);

    // Fetch the config account and check values
    const configAccount = await program.account.config.fetch(config);

    // Use assert for checks

    assert(configAccount, "Config account not found");
    assert(configAccount.authority.equals(keypair.publicKey), "Initializer mismatch");
    assert(configAccount.mintX.equals(mintX), "mintX mismatch");
    assert(configAccount.mintY.equals(mintY), "mintY mismatch");
    assert(configAccount.seed.eq(seed), "Seed mismatch");
    assert.strictEqual(configAccount.fee, fee, "Fee mismatch");

    // Check that vault token accounts exist and are empty
    const vaultXInfo = await connection.getTokenAccountBalance(vaultAtaX);
    const vaultYInfo = await connection.getTokenAccountBalance(vaultAtaY);
    assert.strictEqual(vaultXInfo.value.uiAmount, 0, "Vault X is not empty");
    assert.strictEqual(vaultYInfo.value.uiAmount, 0, "Vault Y is not empty");

    // Check that LP mint exists and has zero supply
    const lpSupply = await connection.getTokenSupply(mintLp);
    assert.strictEqual(lpSupply.value.uiAmount, 0, "LP mint supply is not zero");
  });

  it("Deposit!", async () => {

    const amount = new anchor.BN(30000 * Math.pow(10, 6));
    const max_x = new anchor.BN(20000 * Math.pow(10, 9));
    const max_y = new anchor.BN(40000 * Math.pow(10, 9));

    const tx = await program.methods.deposit(amount, max_x, max_y)
      .accountsStrict({
        user: keypair.publicKey,
        mintX,
        mintY,
        mintLp,
        vaultX: vaultAtaX,
        vaultY: vaultAtaY,
        userX: userAtaX,
        userY: userAtaY,
        userLp: userAtaLp,
        config,
        systemProgram,
        associatedTokenProgram,
        tokenProgram,
      }).rpc();

    await confirmTx(tx);
    console.log("Your transaction signature", tx);

  });

  // it("Withdraw!", async () => {

  //   // Fetch the program account (config) before deposit
  //   // const configAccount = await program.account.config.fetch(config);

  //   const vaultXBalance = await safeGetTokenAccountBalance(vaultAtaX);
  //   const vaultYBalance = await safeGetTokenAccountBalance(vaultAtaY);
  //   const totalSupplyStr = (await connection.getTokenSupply(mintLp)).value.amount;

  //   // const vaultXBalance = BigInt(vaultXBalanceStr);
  //   // const vaultYBalance = BigInt(vaultYBalanceStr);
  //   const totalSupply = Number(totalSupplyStr);


  //   const amountOfX = 80000 * Math.pow(10, 9); // 80,000 X Tokens
  //   const amountOfY = 7880 * Math.pow(10, 9); // 7,880 Y Tokens

  //   let liquidity: number;

  //   if (vaultXBalance === 0 && vaultYBalance === 0) {
  //     // Initial deposit 
  //     liquidity = Math.sqrt(amountOfX * amountOfY);
  //     console.log("Initial deposit amount:", liquidity);
  //   } else {
  //     // Subsequent deposit
  //     const X = amountOfX * totalSupply / vaultXBalance;
  //     const Y = amountOfY * totalSupply / vaultYBalance;
  //     liquidity = Math.min(X, Y);
  //   }
  //   const amount = new anchor.BN((liquidity * Math.pow(10, 6)) / Math.pow(10, 9));
  //   const max_x = new anchor.BN(amountOfX);
  //   const max_y = new anchor.BN(amountOfY);

  //   const tx = await program.methods.deposit(amount, max_x, max_y)
  //     .accountsStrict({
  //       user: keypair.publicKey,
  //       mintX,
  //       mintY,
  //       mintLp,
  //       vaultX: vaultAtaX,
  //       vaultY: vaultAtaY,
  //       userX: userAtaX,
  //       userY: userAtaY,
  //       userLp: userAtaLp,
  //       config,
  //       systemProgram,
  //       associatedTokenProgram,
  //       tokenProgram,
  //     }).rpc();

  //   await confirmTx(tx);
  //   console.log("Your transaction signature", tx);

  // });
  // it("Second Deposit!", async () => {

  //   // Fetch the program account (config) before deposit
  //   // const configAccount = await program.account.config.fetch(config);

  //   const vaultXBalance = await safeGetTokenAccountBalance(vaultAtaX);
  //   const vaultYBalance = await safeGetTokenAccountBalance(vaultAtaY);
  //   const totalSupplyStr = (await connection.getTokenSupply(mintLp)).value.amount;

  //   // const vaultXBalance = BigInt(vaultXBalanceStr);
  //   // const vaultYBalance = BigInt(vaultYBalanceStr);
  //   const totalSupply = Number(totalSupplyStr);


  //   const amountOfX = 80000 * Math.pow(10, 9); // 80,000 X Tokens
  //   const amountOfY = 7880 * Math.pow(10, 9); // 7,880 Y Tokens

  //   let liquidity: number;

  //   if (vaultXBalance === 0 && vaultYBalance === 0) {
  //     // Initial deposit 
  //     liquidity = Math.sqrt(amountOfX * amountOfY);
  //   } else {
  //     // Subsequent deposit
  //     const X = amountOfX * totalSupply / vaultXBalance;
  //     const Y = amountOfY * totalSupply / vaultYBalance;
  //     console.log("X:", X, "Y:", Y);
  //     liquidity = Math.min(X, Y);
  //   }
  //   const amount = new anchor.BN((liquidity * Math.pow(10, 6)) / Math.pow(10, 9));
  //   const max_x = new anchor.BN(amountOfX);
  //   const max_y = new anchor.BN(amountOfY);

  //   const tx = await program.methods.deposit(amount, max_x, max_y)
  //     .accountsStrict({
  //       user: keypair.publicKey,
  //       mintX,
  //       mintY,
  //       mintLp,
  //       vaultX: vaultAtaX,
  //       vaultY: vaultAtaY,
  //       userX: userAtaX,
  //       userY: userAtaY,
  //       userLp: userAtaLp,
  //       config,
  //       systemProgram,
  //       associatedTokenProgram,
  //       tokenProgram,
  //     }).rpc();

  //   await confirmTx(tx);
  //   console.log("Your transaction signature", tx);

  // });


  // Helper function
  const confirmTx = async (signature: string) => {
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction(
      {
        signature,
        ...latestBlockhash,
      },
      "confirmed"
    )
  }

  // Helper to safely get token account balance, returns 0 if account does not exist
  const safeGetTokenAccountBalance = async (pubkey: anchor.web3.PublicKey) => {
    try {
      return (await connection.getTokenAccountBalance(pubkey)).value.uiAmount || 0;
    } catch (e) {
      if (e.message && e.message.includes("could not find account")) {
        return 0;
      }
      throw e;
    }
  };


});
