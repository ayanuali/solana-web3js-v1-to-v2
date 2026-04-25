import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

async function getTokenInfo() {
  const connection = new Connection("https://api.devnet.solana.com");
  const payer = Keypair.generate();
  const mintAddress = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
  const accountAddress = new PublicKey("11111111111111111111111111111111");

  const token = new Token(
    connection,
    mintAddress,
    TOKEN_PROGRAM_ID,
    payer
  );

  // Get account info
  const accountInfo = await token.getAccountInfo(accountAddress);
  console.log("Account balance:", accountInfo.amount.toString());

  // Get mint info
  const mintInfo = await token.getMintInfo();
  console.log("Mint decimals:", mintInfo.decimals);

  return { accountInfo, mintInfo };
}
