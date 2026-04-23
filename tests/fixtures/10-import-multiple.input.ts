// Test 10: Multiple imports and usage
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";

const rpc = new Connection("https://api.mainnet-beta.solana.com");
const wallet: Keypair = Keypair.generate();
const recipient: PublicKey = new PublicKey("11111111111111111111111111111111");

console.log("Wallet:", wallet.publicKey.toString());
console.log("Secret:", wallet.secretKey);
