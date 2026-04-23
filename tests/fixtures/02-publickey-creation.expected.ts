// Test 2: PublicKey creation
import { address, type Address } from "@solana/web3.js";

const recipientAddress = address("11111111111111111111111111111111");
const senderPubkey = address(Buffer.from([1, 2, 3]));
