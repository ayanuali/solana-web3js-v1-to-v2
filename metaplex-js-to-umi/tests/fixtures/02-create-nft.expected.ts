import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplTokenMetadata, createNft } from '@metaplex-foundation/mpl-token-metadata';
import { generateSigner, percentAmount } from '@metaplex-foundation/umi';

async function createNewNft() {
  const umi = createUmi('https://api.devnet.solana.com').use(mplTokenMetadata());
  const wallet = generateSigner(umi);
  
  const mint = generateSigner(umi);
  const nft = await createNft(umi, {
    mint,
    name: 'My NFT',
    symbol: 'MNFT',
    uri: 'https://arweave.net/metadata.json',
    sellerFeeBasisPoints: percentAmount(5),
  }).sendAndConfirm(umi);
  
  console.log('Created NFT:', mint.publicKey);
  
  return nft;
}
