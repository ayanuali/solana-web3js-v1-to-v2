// Test 1: Keypair generation
import { generateKeyPairSigner, createKeyPairSignerFromBytes, type KeyPairSigner } from "@solana/web3.js";

const keypair = await generateKeyPairSigner();
console.log("Public key:", keypair.address.toString());
console.log("Secret key length:", keypair.privateKey.length);
