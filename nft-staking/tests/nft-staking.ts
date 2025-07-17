import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { NftStaking } from "../target/types/nft_staking";
import wallet from "/home/xpsolitesol/Turbin3/turbin3-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { generateSigner, createSignerFromKeypair, signerIdentity, percentAmount } from "@metaplex-foundation/umi"
import base58 from "bs58";
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

describe("nft-staking", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.nftStaking as Program<NftStaking>;

  const connection = anchor.AnchorProvider.env().connection;

  const keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(wallet));

  let config: anchor.web3.PublicKey;
  let rewardMint: anchor.web3.PublicKey;

  before(async () => {

    //Mint an NFT using Metaplex Umi
    const RPC_ENDPOINT = "https://api.devnet.solana.com";
    const umi = createUmi(RPC_ENDPOINT);

    const umiKeypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));

    const myKeypairSigner = createSignerFromKeypair(umi, umiKeypair);
    umi.use(signerIdentity(myKeypairSigner));
    umi.use(mplTokenMetadata())

    const mint = generateSigner(umi);

    // Create the NFT
    let tx = createNft(umi, {
      mint,
      name: "Berg Rug",
      symbol: "BMR",
      uri: "https://gateway.irys.xyz/F5Dg5aDbHo2QsQm7YuqdC9c5ARdnUM1vysJSzYLm1TQA",
      sellerFeeBasisPoints: percentAmount(2), // 2% royalty
    })

    let result = await tx.sendAndConfirm(umi);
    const signature = base58.encode(result.signature);

    console.log(`Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)

    console.log("Mint Address: ", mint.publicKey);

    [config] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );

    [rewardMint] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("reward"), keypair.publicKey.toBuffer()],
      program.programId
    );
  })

  it("Is initialized!", async () => {
    const points_per_stake = 10; // Points per stake
    const max_stake = 10; // Maximum number of NFTs that can be staked
    const freeze_period = 60 * 60 * 24; // Freeze period in seconds (1 day)

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
  
});


