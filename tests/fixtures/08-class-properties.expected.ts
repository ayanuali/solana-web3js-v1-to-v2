// Test 8: Class with keypair properties
import { generateKeyPairSigner, createKeyPairSignerFromBytes, type KeyPairSigner, address, type Address } from "@solana/web3.js";

class Wallet {
  private signer: KeyPairSigner;
  public address: Address;

  constructor() {
    this.signer = await generateKeyPairSigner();
    this.address = this.signer.address;
  }

  getSecretKey(): Uint8Array {
    return this.signer.privateKey;
  }

  getPublicKey(): Address {
    return this.signer.address;
  }
}
