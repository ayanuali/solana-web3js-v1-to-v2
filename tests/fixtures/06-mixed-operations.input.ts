// Test 6: Mixed operations (real-world example)
import { Connection, Keypair, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";

async function transferSOL() {
  const connection = new Connection("https://api.devnet.solana.com");
  const payer = Keypair.generate();
  const recipient = new PublicKey("4uQeVj5tqViQh7yWWGStvkEG1Zmhx6uasJtWCJziofM");

  const balance = await connection.getBalance(payer.publicKey);
  const latestBlockhash = await connection.getLatestBlockhash();

  console.log(`Payer address: ${payer.publicKey.toString()}`);
  console.log(`Balance: ${balance}`);
}
