// Test 8: Class with keypair properties
import { Keypair, PublicKey } from "@solana/web3.js";

class Wallet {
  private signer: Keypair;
  public address: PublicKey;

  constructor() {
    this.signer = Keypair.generate();
    this.address = this.signer.publicKey;
  }

  getSecretKey(): Uint8Array {
    return this.signer.secretKey;
  }

  getPublicKey(): PublicKey {
    return this.signer.publicKey;
  }
}
