import wallet from "../../turbin3-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        // Follow this JSON structure
        // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

        const image = "https://gateway.irys.xyz/Du6NWVzM6Cw1Y5gfzq6zB1vcBkWU6xdjJZNYBbNPb1Qx"
        const metadata = {
            name: "Berg Rug",
            symbol: "TPR",
            description: "?]This is a berg rug. It is a test NFT for the Solana Starter project.",
            image,
            attributes: [
                {trait_type: 'Turbin3', value: 'Rug'},
                {trait_type: 'Berg', value: 'Rug'},
                {trait_type: 'Jeff', value: 'Rug'}
            ],
            properties: {
                files: [
                    {
                        type: "image/png",
                        uri: "?"
                    },
                ]
            },
            creators: [
                {
                    address: keypair.publicKey.toString(),
                    share: 100
                }
            ]
        };
        const myUri = await umi.uploader.uploadJson(metadata);
        console.log("Your metadata URI: ", myUri);
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
