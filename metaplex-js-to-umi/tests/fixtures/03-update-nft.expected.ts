import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplTokenMetadata, updateV1, fetchDigitalAsset } from '@metaplex-foundation/mpl-token-metadata';
import { publicKey } from '@metaplex-foundation/umi';

async function updateNftMetadata() {
  const umi = createUmi('https://api.devnet.solana.com').use(mplTokenMetadata());
  
  const mintAddress = publicKey('7XaEGmNWGjTJtWnHQNwZwKmNLQwVqHJ8JZV1e2GGvQkp');
  const asset = await fetchDigitalAsset(umi, mintAddress);
  
  const response = await updateV1(umi, {
    mint: mintAddress,
    authority: umi.identity,
    data: {
      ...asset.metadata,
      name: 'Updated NFT Name',
      symbol: 'UPDT',
    },
  }).sendAndConfirm(umi);
  
  console.log('Update signature:', response.signature);
  
  return response;
}
