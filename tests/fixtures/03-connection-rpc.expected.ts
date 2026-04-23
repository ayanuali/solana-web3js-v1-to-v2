// Test 3: Connection to RPC
import { createSolanaRpc, generateKeyPairSigner, createKeyPairSignerFromBytes, type KeyPairSigner } from "@solana/web3.js";

const connection = createSolanaRpc("https://api.mainnet-beta.solana.com");
const owner: ReturnType<typeof createSolanaRpc> = await generateKeyPairSigner();

async function getBalance() {
  const balance = await connection.getBalance(owner.address).send();
  const accountInfo = await connection.getAccountInfo(owner.address).send();
  return { balance, accountInfo };
}
