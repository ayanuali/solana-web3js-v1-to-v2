// Test 7: Multiple RPC method calls
import { Connection, PublicKey } from "@solana/web3.js";

async function fetchAccountData(address: string) {
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  const pubkey = new PublicKey(address);

  const accountInfo = await connection.getAccountInfo(pubkey);
  const slot = await connection.getSlot();
  const blockTime = await connection.getBlockTime(slot);
  const version = await connection.getVersion();

  return { accountInfo, slot, blockTime, version };
}
