// Test 7: Multiple RPC method calls
import { createSolanaRpc, address, type Address } from "@solana/web3.js";

async function fetchAccountData(address: string) {
  const connection = createSolanaRpc("https://api.mainnet-beta.solana.com");
  const pubkey = address(address);

  const accountInfo = await connection.getAccountInfo(pubkey).send();
  const slot = await connection.getSlot().send();
  const blockTime = await connection.getBlockTime(slot).send();
  const version = await connection.getVersion().send();

  return { accountInfo, slot, blockTime, version };
}
