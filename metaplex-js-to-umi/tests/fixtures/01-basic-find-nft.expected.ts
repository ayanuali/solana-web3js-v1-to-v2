import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplTokenMetadata, fetchDigitalAsset } from '@metaplex-foundation/mpl-token-metadata';
import { publicKey } from '@metaplex-foundation/umi';

async function findNftByMint() {
  const umi = createUmi('https://api.mainnet-beta.solana.com').use(mplTokenMetadata());
  
  const mintAddress = publicKey('7XaEGmNWGjTJtWnHQNwZwKmNLQwVqHJ8JZV1e2GGvQkp');
  const nft = await fetchDigitalAsset(umi, mintAddress);
  
  console.log('NFT Name:', nft.metadata.name);
  console.log('NFT Symbol:', nft.metadata.symbol);
  
  return nft;
}
