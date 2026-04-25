import { Metaplex } from '@metaplex-foundation/js';
import { Connection } from '@solana/web3.js';

async function uploadNftMetadata() {
  const connection = new Connection('https://api.devnet.solana.com');
  const metaplex = Metaplex.make(connection);
  
  const metadata = {
    name: 'My NFT',
    symbol: 'MNFT',
    description: 'This is my amazing NFT',
    image: 'https://arweave.net/image.png',
    attributes: [
      { trait_type: 'Background', value: 'Blue' },
      { trait_type: 'Rarity', value: 'Common' },
    ],
  };
  
  const { uri } = await metaplex.nfts().uploadMetadata(metadata);
  
  console.log('Metadata URI:', uri);
  
  return uri;
}
