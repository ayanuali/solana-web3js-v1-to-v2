import { Connection, Keypair } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

async function createNewToken() {
  const connection = new Connection("https://api.devnet.solana.com");
  const payer = Keypair.generate();
  const mintAuthority = Keypair.generate();
  const freezeAuthority = Keypair.generate();

  // Create a new token mint
  const mint = await Token.createMint(
    connection,
    payer,
    mintAuthority.publicKey,
    freezeAuthority.publicKey,
    9,
    TOKEN_PROGRAM_ID
  );

  console.log("Token mint created:", mint.publicKey.toBase58());
  
  return mint;
}
