import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplTokenMetadata, fetchDigitalAsset, createNft } from '@metaplex-foundation/mpl-token-metadata';
import { publicKey, Umi, generateSigner, percentAmount } from '@metaplex-foundation/umi';

class NftService {
  private umi: Umi;
  
  constructor(cluster: 'devnet' | 'mainnet-beta') {
    const endpoint = cluster === 'devnet' 
      ? 'https://api.devnet.solana.com'
      : 'https://api.mainnet-beta.solana.com';
    this.umi = createUmi(endpoint).use(mplTokenMetadata());
  }
  
  async getNft(mintAddress: string) {
    const mint = publicKey(mintAddress);
    return await fetchDigitalAsset(this.umi, mint);
  }
  
  async uploadAndCreate(metadata: any) {
    const uri = await this.umi.uploader.uploadJson(metadata);
    
    const mint = generateSigner(this.umi);
    const nft = await createNft(this.umi, {
      mint,
      name: metadata.name,
      symbol: metadata.symbol,
      uri,
      sellerFeeBasisPoints: percentAmount(5),
    }).sendAndConfirm(this.umi);
    
    return nft;
  }
}

export default NftService;
