import { Metaplex } from '@metaplex-foundation/js';
import { Connection, Keypair } from '@solana/web3.js';

async function createNewNft() {
  const connection = new Connection('https://api.devnet.solana.com');
  const wallet = Keypair.generate();
  const metaplex = Metaplex.make(connection).use({ wallet });
  
  const { nft } = await metaplex.nfts().create({
    name: 'My NFT',
    symbol: 'MNFT',
    uri: 'https://arweave.net/metadata.json',
    sellerFeeBasisPoints: 500,
  });
  
  console.log('Created NFT:', nft.address.toString());
  
  return nft;
}
