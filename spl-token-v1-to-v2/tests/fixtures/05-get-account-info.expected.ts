import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getAccount, getMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";

async function getTokenInfo() {
  const connection = new Connection("https://api.devnet.solana.com");
  const payer = Keypair.generate();
  const mintAddress = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
  const accountAddress = new PublicKey("11111111111111111111111111111111");

  // Token instance removed - using standalone functions

  // Get account info
  const accountInfo = await getAccount(connection, accountAddress);
  console.log("Account balance:", accountInfo.amount.toString());

  // Get mint info
  const mintInfo = await getMint(connection, mintAddress);
  console.log("Mint decimals:", mintInfo.decimals);

  return { accountInfo, mintInfo };
}
