// Test 4: Keypair from secret key
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

const secretKeyString = process.env.WALLET_PRIVATE_KEY!;
const owner = Keypair.fromSecretKey(bs58.decode(secretKeyString));

console.log("Address:", owner.publicKey.toBase58());
