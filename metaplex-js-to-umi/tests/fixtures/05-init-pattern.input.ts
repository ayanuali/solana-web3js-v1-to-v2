import { Metaplex } from '@metaplex-foundation/js';
import { Connection, clusterApiUrl } from '@solana/web3.js';

class NftService {
  private metaplex: Metaplex;
  
  constructor(cluster: 'devnet' | 'mainnet-beta') {
    const connection = new Connection(clusterApiUrl(cluster));
    this.metaplex = Metaplex.make(connection);
  }
  
  async getNft(mintAddress: string) {
    const publicKey = new PublicKey(mintAddress);
    return await this.metaplex.nfts().findByMint({ mintAddress: publicKey });
  }
  
  async uploadAndCreate(metadata: any) {
    const { uri } = await this.metaplex.nfts().uploadMetadata(metadata);
    
    const { nft } = await this.metaplex.nfts().create({
      name: metadata.name,
      symbol: metadata.symbol,
      uri,
      sellerFeeBasisPoints: 500,
    });
    
    return nft;
  }
}

export default NftService;
