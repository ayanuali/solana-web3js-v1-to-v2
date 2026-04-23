// Test 10: Multiple imports and usage
import {
  createSolanaRpc,
  generateKeyPairSigner, createKeyPairSignerFromBytes, type KeyPairSigner,
  address, type Address,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";

const rpc = createSolanaRpc("https://api.mainnet-beta.solana.com");
const wallet: KeyPairSigner = await generateKeyPairSigner();
const recipient: Address = address("11111111111111111111111111111111");

console.log("Wallet:", wallet.address.toString());
console.log("Secret:", wallet.privateKey);
