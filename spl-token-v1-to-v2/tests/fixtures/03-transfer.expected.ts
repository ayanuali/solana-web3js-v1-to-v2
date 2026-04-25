import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { transfer, TOKEN_PROGRAM_ID } from "@solana/spl-token";

async function transferTokens() {
  const connection = new Connection("https://api.devnet.solana.com");
  const payer = Keypair.generate();
  const mintAddress = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
  const owner = Keypair.generate();
  
  const sourceAccount = new PublicKey("11111111111111111111111111111111");
  const destAccount = new PublicKey("22222222222222222222222222222222");

  // Token instance removed - using standalone functions

  // Transfer 100 tokens
  const signature = await transfer(
    connection,
    payer,
    sourceAccount,
    destAccount,
    owner,
    100
  );

  console.log("Transfer signature:", signature);
  
  return signature;
}
