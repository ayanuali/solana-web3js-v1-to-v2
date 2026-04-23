// Test 4: Keypair from secret key
import { generateKeyPairSigner, createKeyPairSignerFromBytes, type KeyPairSigner } from "@solana/web3.js";
import bs58 from "bs58";

const secretKeyString = process.env.WALLET_PRIVATE_KEY!;
const owner = await createKeyPairSignerFromBytes(bs58.decode(secretKeyString));

console.log("Address:", owner.address.toBase58());
