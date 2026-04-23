// Test 5: Type annotations
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

function processWallet(wallet: Keypair): PublicKey {
  return wallet.publicKey;
}

function getRpcClient(): Connection {
  return new Connection("https://api.devnet.solana.com");
}

const myKeypair: Keypair = Keypair.generate();
const myAddress: PublicKey = myKeypair.publicKey;
