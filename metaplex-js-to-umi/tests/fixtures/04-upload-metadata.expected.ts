import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';

async function uploadNftMetadata() {
  const umi = createUmi('https://api.devnet.solana.com').use(mplTokenMetadata());
  
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
  
  const uri = await umi.uploader.uploadJson(metadata);
  
  console.log('Metadata URI:', uri);
  
  return uri;
}
