// Test 2: PublicKey creation
import { PublicKey } from "@solana/web3.js";

const recipientAddress = new PublicKey("11111111111111111111111111111111");
const senderPubkey = new PublicKey(Buffer.from([1, 2, 3]));
