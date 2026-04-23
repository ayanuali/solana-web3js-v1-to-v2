// Test 6: Mixed operations (real-world example)
import { createSolanaRpc, generateKeyPairSigner, createKeyPairSignerFromBytes, type KeyPairSigner, address, type Address, Transaction, SystemProgram } from "@solana/web3.js";

async function transferSOL() {
  const connection = createSolanaRpc("https://api.devnet.solana.com");
  const payer = await generateKeyPairSigner();
  const recipient = address("4uQeVj5tqViQh7yWWGStvkEG1Zmhx6uasJtWCJziofM");

  const balance = await connection.getBalance(payer.address).send();
  const latestBlockhash = await connection.getLatestBlockhash().send();

  console.log(`Payer address: ${payer.address.toString()}`);
  console.log(`Balance: ${balance}`);
}
