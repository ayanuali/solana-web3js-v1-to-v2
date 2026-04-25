import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

async function setupTokenAccount() {
  const connection = new Connection("https://api.devnet.solana.com");
  const payer = Keypair.generate();
  const mintAddress = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
  const owner = Keypair.generate();

  // Create Token instance
  const token = new Token(
    connection,
    mintAddress,
    TOKEN_PROGRAM_ID,
    payer
  );

  // Create a token account
  const tokenAccount = await token.createAccount(owner.publicKey);

  console.log("Token account created:", tokenAccount.toBase58());
  
  return tokenAccount;
}
