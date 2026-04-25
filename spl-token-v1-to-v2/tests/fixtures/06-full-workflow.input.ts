import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

async function completeTokenWorkflow() {
  const connection = new Connection("https://api.devnet.solana.com");
  const payer = Keypair.generate();
  const mintAuthority = Keypair.generate();
  const freezeAuthority = Keypair.generate();
  
  // Step 1: Create a new token mint
  const mint = await Token.createMint(
    connection,
    payer,
    mintAuthority.publicKey,
    freezeAuthority.publicKey,
    9,
    TOKEN_PROGRAM_ID
  );

  console.log("Mint created:", mint.publicKey.toBase58());

  // Step 2: Create Token instance
  const token = new Token(
    connection,
    mint.publicKey,
    TOKEN_PROGRAM_ID,
    payer
  );

  // Step 3: Create associated token account
  const owner = Keypair.generate();
  const ata = await token.createAssociatedTokenAccount(owner.publicKey);
  console.log("ATA created:", ata.toBase58());

  // Step 4: Get ATA address manually
  const ataAddress = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint.publicKey,
    owner.publicKey
  );
  console.log("ATA address:", ataAddress.toBase58());

  // Step 5: Mint tokens to the account
  await token.mintTo(
    ata,
    mintAuthority,
    [],
    1_000_000
  );

  // Step 6: Get account info
  const accountInfo = await token.getAccountInfo(ata);
  console.log("Account balance:", accountInfo.amount.toString());

  // Step 7: Create another account and transfer
  const recipient = Keypair.generate();
  const recipientAta = await token.createAssociatedTokenAccount(recipient.publicKey);
  
  await token.transfer(
    ata,
    recipientAta,
    owner,
    [],
    500_000
  );

  // Step 8: Approve a delegate
  const delegate = Keypair.generate();
  await token.approve(
    ata,
    delegate.publicKey,
    owner,
    [],
    100_000
  );

  // Step 9: Revoke the approval
  await token.revoke(
    ata,
    owner,
    []
  );

  // Step 10: Burn some tokens
  await token.burn(
    ata,
    owner,
    [],
    50_000
  );

  // Step 11: Get final mint info
  const mintInfo = await token.getMintInfo();
  console.log("Total supply:", mintInfo.supply.toString());

  return {
    mint: mint.publicKey,
    ata,
    recipientAta
  };
}

export { completeTokenWorkflow };
