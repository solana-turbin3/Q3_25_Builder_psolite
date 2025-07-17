import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { NftStaking } from "../target/types/nft_staking";
import wallet from "/home/xpsolitesol/Turbin3/turbin3-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { generateSigner, createSignerFromKeypair, signerIdentity, percentAmount } from "@metaplex-foundation/umi"
import base58 from "bs58";
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

describe("nft-staking", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.nftStaking as Program<NftStaking>;

  const connection = anchor.AnchorProvider.env().connection;

  const keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(wallet));

  let config: anchor.web3.PublicKey;
  let rewardMint: anchor.web3.PublicKey;
  let userAccount: anchor.web3.PublicKey;
  const mint: anchor.web3.PublicKey = new anchor.web3.PublicKey("BTWHB6HePvPCeHoH5EBN7A9d6zKHegA3SMjGFYSV7vE6");
  const collectionMint: anchor.web3.PublicKey = new anchor.web3.PublicKey("3aPBCKneaZVEh9r8R6CpJiJxHsRTbuVNfi4q2SDEAAeF");
  let userAta: anchor.web3.PublicKey;
  let metadata: anchor.web3.PublicKey;
  let edition: anchor.web3.PublicKey;
  let stakeAccount: anchor.web3.PublicKey;
  const metadata_program = new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

  before(async () => {
    // Uncomment the following lines to mint an NFT using Metaplex Umi
    // --------------------------- Start Minting NFT ---------------------------
    //Mint an NFT using Metaplex Umi
    // const RPC_ENDPOINT = "https://api.devnet.solana.com";
    // const umi = createUmi(RPC_ENDPOINT);

    // const umiKeypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));

    // const myKeypairSigner = createSignerFromKeypair(umi, umiKeypair);
    // umi.use(signerIdentity(myKeypairSigner));
    // umi.use(mplTokenMetadata())

    // // Create the collection mint
    // const collection_mint = generateSigner(umi);

    // // Create the collection NFT
    // let collectionTx = createNft(umi, {
    //   mint: collection_mint,
    //   name: "Berg Rug Collection",
    //   symbol: "BMRC",
    //   uri: "https://gateway.irys.xyz/collection-metadata-uri.json",
    //   sellerFeeBasisPoints: percentAmount(0), // No royalty for collection
    //   isCollection: true,
    // });

    // await collectionTx.sendAndConfirm(umi);

    // // Create the NFT and assign it to the collection
    // const tokenMint = generateSigner(umi);

    // let tx = createNft(umi, {
    //   mint: tokenMint,
    //   name: "Berg Rug",
    //   symbol: "BMR",
    //   uri: "https://gateway.irys.xyz/F5Dg5aDbHo2QsQm7YuqdC9c5ARdnUM1vysJSzYLm1TQA",
    //   sellerFeeBasisPoints: percentAmount(2), // 2% royalty
    //   collection: {
    //   key: collection_mint.publicKey,
    //   verified: false, // Will need to verify collection after minting
    //   },
    // });

    // let result = await tx.sendAndConfirm(umi);
    // const signature = base58.encode(result.signature);

    // console.log(`Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)

    // mint = new anchor.web3.PublicKey(tokenMint.publicKey)
    // collectionMint = new anchor.web3.PublicKey(collection_mint.publicKey)
    // console.log("Mint Address: ", mint);
    // console.log("Collection Mint Address: ", collectionMint);
    // --------------------------- End Minting NFT ---------------------------

    userAta = anchor.utils.token.associatedAddress({
      mint,
      owner: keypair.publicKey,
    });

    [config] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );

    [rewardMint] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("reward"), keypair.publicKey.toBuffer()],
      program.programId
    );

    [userAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), keypair.publicKey.toBuffer()],
      program.programId
    );

    [metadata] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("metadata"), metadata_program.toBuffer(), mint.toBuffer()],
      metadata_program
    );

    [edition] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("metadata"), metadata_program.toBuffer(), mint.toBuffer(), Buffer.from("edition")],
      metadata_program
    );

    [stakeAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("stake"), mint.toBuffer(), config.toBuffer()],
      program.programId
    );
    console.log("stakeAccount: ", stakeAccount.toBase58());
    console.log("config: ", config.toBase58());
    console.log("rewardMint: ", rewardMint.toBase58());
    console.log("userAccount: ", userAccount.toBase58());
    console.log("userAta: ", userAta.toBase58());
    console.log("metadata: ", metadata.toBase58());
    console.log("edition: ", edition.toBase58());

  })

  it("Is initialized Config!", async () => {
    const points_per_stake = 10; // Points per stake
    const max_stake = 10; // Maximum number of NFTs that can be staked
    const freeze_period = 1; // Freeze period in seconds (1 day)
    const fetchConfig = await program.account.stakeConfig.fetch(config);
    console.log("Current Config: ", fetchConfig);
    const tx = await program.methods.initializeConfig(points_per_stake, max_stake, freeze_period)
      .accountsStrict({
        owner: keypair.publicKey,
        config,
        rewardMint,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });

  it("Is initialized User!", async () => {

    const tx = await program.methods.initializeUser()
      .accountsStrict({
        user: keypair.publicKey,
        userAccount,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
    console.log("Your transaction signature", tx);
    const fetchUser = await program.account.userAccount.fetch(userAccount);
    console.log("Current User Account: ", fetchUser);
  });

  it("Stake NFT!", async () => {

    const tx = await program.methods.stake()
      .accountsStrict({
        user: keypair.publicKey,
        mint,
        collectionMint,
        userAta,
        metadata,
        edition,
        config,
        userAccount,
        stakeAccount,
        metadataProgram: metadata_program,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Your transaction signature", tx);
    const fetchStake = await program.account.stakeAccount.fetch(stakeAccount);
    console.log("Current Stake Account: ", fetchStake);
  });

  it("UnStake NFT!", async () => {

    const tx = await program.methods.unstake()
      .accountsStrict({
        user: keypair.publicKey,
        mint,
        userAta,
        edition,
        config,
        userAccount,
        stakeAccount,
        metadataProgram: metadata_program,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });

});


