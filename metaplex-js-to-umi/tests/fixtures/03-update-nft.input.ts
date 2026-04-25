import { Metaplex } from '@metaplex-foundation/js';
import { Connection, PublicKey } from '@solana/web3.js';

async function updateNftMetadata() {
  const connection = new Connection('https://api.devnet.solana.com');
  const metaplex = Metaplex.make(connection);
  
  const mintAddress = new PublicKey('7XaEGmNWGjTJtWnHQNwZwKmNLQwVqHJ8JZV1e2GGvQkp');
  
  const { response } = await metaplex.nfts().update({
    nftOrSft: mintAddress,
    name: 'Updated NFT Name',
    symbol: 'UPDT',
  });
  
  console.log('Update signature:', response.signature);
  
  return response;
}
