import { Metaplex } from '@metaplex-foundation/js';
import { Connection, PublicKey } from '@solana/web3.js';

async function findNftByMint() {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const metaplex = Metaplex.make(connection);
  
  const mintAddress = new PublicKey('7XaEGmNWGjTJtWnHQNwZwKmNLQwVqHJ8JZV1e2GGvQkp');
  const nft = await metaplex.nfts().findByMint({ mintAddress });
  
  console.log('NFT Name:', nft.name);
  console.log('NFT Symbol:', nft.symbol);
  
  return nft;
}
