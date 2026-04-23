// Test 5: Type annotations
import { createSolanaRpc, generateKeyPairSigner, createKeyPairSignerFromBytes, type KeyPairSigner, address, type Address } from "@solana/web3.js";

function processWallet(wallet: KeyPairSigner): Address {
  return wallet.address;
}

function getRpcClient(): ReturnType<typeof createSolanaRpc> {
  return createSolanaRpc("https://api.devnet.solana.com");
}

const myKeypair: KeyPairSigner = await generateKeyPairSigner();
const myAddress: Address = myKeypair.address;
