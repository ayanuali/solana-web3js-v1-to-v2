// Test 9: Destructuring patterns
import { createSolanaRpc, generateKeyPairSigner, createKeyPairSignerFromBytes, type KeyPairSigner } from "@solana/web3.js";

const connection = createSolanaRpc("https://api.devnet.solana.com");
const { address, privateKey } = await generateKeyPairSigner();

async function getInfo() {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash().send();
  return { blockhash, lastValidBlockHeight, address };
}
