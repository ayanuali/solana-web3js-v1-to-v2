// Test 1: Keypair generation
import { Keypair } from "@solana/web3.js";

const keypair = Keypair.generate();
console.log("Public key:", keypair.publicKey.toString());
console.log("Secret key length:", keypair.secretKey.length);
