import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorMarketplace } from "../target/types/anchor_marketplace";
import wallet from "/home/xpsolitesol/Turbin3/turbin3-wallet.json";
import takerWallet from "/home/xpsolitesol/PsoZSQhHg7USeEx8qQLKNhjXARH1XBUj8iGDNp5Y22V.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { generateSigner, createSignerFromKeypair, signerIdentity, percentAmount } from "@metaplex-foundation/umi"
import base58 from "bs58";
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";

describe("anchor-marketplace", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.anchorMarketplace as Program<AnchorMarketplace>;
  const keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(wallet));
  const taker_keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(takerWallet));


  let marketplace: anchor.web3.PublicKey;
  let treasury: anchor.web3.PublicKey;
  let rewardMint: anchor.web3.PublicKey;
  const mint: anchor.web3.PublicKey = new anchor.web3.PublicKey("86uMqozvV2FwJepQpwkrEK7VZV2AJx2veKcuPejairi7");
  const collectionMint: anchor.web3.PublicKey = new anchor.web3.PublicKey("ET3bxbTB45wQ7tuBZ1EsH8NQp9kWFFkCMPxQUaTqw4dK");
  // let mint: anchor.web3.PublicKey 
  // let collectionMint: anchor.web3.PublicKey
  let makerAta: anchor.web3.PublicKey;
  let takerAta: anchor.web3.PublicKey;
  let vaultAta: anchor.web3.PublicKey;
  let listing: anchor.web3.PublicKey;
  let metadata: anchor.web3.PublicKey;
  let edition: anchor.web3.PublicKey;
  let stakeAccount: anchor.web3.PublicKey;
  const metadataProgram = new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  const systemProgram = anchor.web3.SystemProgram.programId
  const tokenProgram = anchor.utils.token.TOKEN_PROGRAM_ID
  const associatedTokenProgram = ASSOCIATED_TOKEN_PROGRAM_ID

  const name = "rug_mm"

  before(async () => {
    // Uncomment the following lines to mint an NFT using Metaplex Umi
    // --------------------------- Start Minting NFT ---------------------------
    // // Mint an NFT using Metaplex Umi
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

    [marketplace] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("marketplace"), Buffer.from(name)],
      program.programId
    );

    [treasury] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), marketplace.toBuffer()],
      program.programId
    );

    [rewardMint] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("rewards"), marketplace.toBuffer()],
      program.programId
    );

    makerAta = anchor.utils.token.associatedAddress({
      mint,
      owner: keypair.publicKey,
    });

    takerAta = anchor.utils.token.associatedAddress({
      mint,
      owner: taker_keypair.publicKey,
    });


    [listing] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("list"), marketplace.toBuffer(), mint.toBuffer()],
      program.programId
    );

    vaultAta = await getAssociatedTokenAddress(
      mint,
      listing,
      true
    );

    [metadata] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("metadata"), metadataProgram.toBuffer(), mint.toBuffer()],
      metadataProgram
    );

    [edition] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("metadata"), metadataProgram.toBuffer(), mint.toBuffer(), Buffer.from("edition")],
      metadataProgram
    );

    console.log("marketplace: ", marketplace.toBase58());
    console.log("treasury: ", treasury.toBase58());
    console.log("rewardMint: ", rewardMint.toBase58());
    console.log("vaultAta: ", vaultAta.toBase58());
    console.log("makerAta: ", makerAta.toBase58());
    console.log("listing: ", listing.toBase58());
    console.log("metadata: ", metadata.toBase58());
    console.log("edition: ", edition.toBase58());

  })

  it("Is initialized!", async () => {
    const fee = 20
    const tx = await program.methods.initialize(name, fee)
      .accountsStrict({
        admin: keypair.publicKey,
        marketplace,
        treasury,
        rewardMint,
        systemProgram,
        tokenProgram
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });


  it("Is Listing An NFT!", async () => {
    const price = new anchor.BN(2000000000)
    const tx = await program.methods.listing(price)
      .accountsStrict({
        maker: keypair.publicKey,
        mint,
        marketplace,
        makerAta,
        vaultAta,
        listing,
        collectionMint,
        metadata,
        edition,
        metadataProgram,
        systemProgram,
        tokenProgram,
        associatedTokenProgram
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });

  // You have to comment out Delist to test Purchase 

  it("Is DeListing An NFT!", async () => {
    const tx = await program.methods.delisting()
      .accountsStrict({
        maker: keypair.publicKey,
        mint,
        marketplace,
        makerAta,
        vaultAta,
        listing,
        collectionMint,
        metadata,
        edition,
        metadataProgram,
        systemProgram,
        tokenProgram,
        associatedTokenProgram
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });

  it("Is Purchasing An NFT!", async () => {
    const tx = await program.methods.purchase()
      .accountsStrict({
        taker: taker_keypair.publicKey,
        maker: keypair.publicKey,
        mint,
        takerAta,
        makerAta,
        marketplace,
        treasury,
        vaultAta,
        listing,
        collectionMint,
        metadata,
        edition,
        metadataProgram,
        systemProgram,
        tokenProgram,
        associatedTokenProgram
      })
      .signers([taker_keypair])
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
