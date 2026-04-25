import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  createMint,
  createAssociatedTokenAccount,
  getAssociatedTokenAddress,
  mintTo,
  getAccount,
  transfer,
  approve,
  revoke,
  burn,
  getMint,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from "@solana/spl-token";

async function completeTokenWorkflow() {
  const connection = new Connection("https://api.devnet.solana.com");
  const payer = Keypair.generate();
  const mintAuthority = Keypair.generate();
  const freezeAuthority = Keypair.generate();
  
  // Step 1: Create a new token mint
  const mint = await createMint(
    connection,
    payer,
    mintAuthority.publicKey,
    freezeAuthority.publicKey,
    9,
    TOKEN_PROGRAM_ID
  );

  console.log("Mint created:", mint.toBase58());

  // Step 2: Token instance removed - using standalone functions

  // Step 3: Create associated token account
  const owner = Keypair.generate();
  const ata = await createAssociatedTokenAccount(connection, payer, mint, owner.publicKey);
  console.log("ATA created:", ata.toBase58());

  // Step 4: Get ATA address manually
  const ataAddress = await getAssociatedTokenAddress(
    mint,
    owner.publicKey
  );
  console.log("ATA address:", ataAddress.toBase58());

  // Step 5: Mint tokens to the account
  await mintTo(
    connection,
    payer,
    mint,
    ata,
    mintAuthority,
    1_000_000
  );

  // Step 6: Get account info
  const accountInfo = await getAccount(connection, ata);
  console.log("Account balance:", accountInfo.amount.toString());

  // Step 7: Create another account and transfer
  const recipient = Keypair.generate();
  const recipientAta = await createAssociatedTokenAccount(connection, payer, mint, recipient.publicKey);
  
  await transfer(
    connection,
    payer,
    ata,
    recipientAta,
    owner,
    500_000
  );

  // Step 8: Approve a delegate
  const delegate = Keypair.generate();
  await approve(
    connection,
    payer,
    ata,
    delegate.publicKey,
    owner,
    100_000
  );

  // Step 9: Revoke the approval
  await revoke(
    connection,
    payer,
    ata,
    owner
  );

  // Step 10: Burn some tokens
  await burn(
    connection,
    payer,
    ata,
    mint,
    owner,
    50_000
  );

  // Step 11: Get final mint info
  const mintInfo = await getMint(connection, mint);
  console.log("Total supply:", mintInfo.supply.toString());

  return {
    mint: mint,
    ata,
    recipientAta
  };
}

export { completeTokenWorkflow };
