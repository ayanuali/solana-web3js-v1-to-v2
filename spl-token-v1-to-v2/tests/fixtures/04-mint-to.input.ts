import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

async function mintTokens() {
  const connection = new Connection("https://api.devnet.solana.com");
  const payer = Keypair.generate();
  const mintAddress = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
  const mintAuthority = Keypair.generate();
  const destination = new PublicKey("11111111111111111111111111111111");

  const token = new Token(
    connection,
    mintAddress,
    TOKEN_PROGRAM_ID,
    payer
  );

  // Mint 1000 tokens to destination
  const signature = await token.mintTo(
    destination,
    mintAuthority,
    [],
    1000
  );

  console.log("Mint signature:", signature);
  
  return signature;
}
