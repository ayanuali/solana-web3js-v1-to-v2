// Test 3: Connection to RPC
import { Connection, Keypair } from "@solana/web3.js";

const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
const owner: Keypair = Keypair.generate();

async function getBalance() {
  const balance = await connection.getBalance(owner.publicKey);
  const accountInfo = await connection.getAccountInfo(owner.publicKey);
  return { balance, accountInfo };
}
