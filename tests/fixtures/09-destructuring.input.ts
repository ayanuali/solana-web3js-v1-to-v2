// Test 9: Destructuring patterns
import { Connection, Keypair } from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com");
const { publicKey, secretKey } = Keypair.generate();

async function getInfo() {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  return { blockhash, lastValidBlockHeight, publicKey };
}
