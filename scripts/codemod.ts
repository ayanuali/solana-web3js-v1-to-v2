/**
 * Solana web3.js v1 → v2 Migration Codemod
 *
 * Automates migration from @solana/web3.js v1 to v2 (now @solana/kit)
 * Handles: Keypair → KeyPairSigner, PublicKey → Address, Connection → RPC, and more
 */

import type { Codemod, Edit } from "codemod:ast-grep";
import type TSX from "codemod:ast-grep/langs/tsx";

const codemod: Codemod<TSX> = async (root) => {
  const rootNode = root.root();
  const edits: Edit[] = [];

  // ============================================================
  // 1. Keypair.generate() → generateKeyPairSigner()
  // ============================================================
  const keypairGenerateCalls = rootNode.findAll({
    rule: {
      kind: "call_expression",
      has: {
        field: "function",
        regex: "Keypair\\.generate"
      }
    }
  });

  for (const node of keypairGenerateCalls) {
    // Keypair.generate() → generateKeyPairSigner()
    const replacement = "await generateKeyPairSigner()";
    edits.push(node.replace(replacement));
  }

  // ============================================================
  // 2. Keypair.fromSecretKey() → createKeyPairSignerFromBytes()
  // ============================================================
  const keypairFromSecretKeyCalls = rootNode.findAll({
    rule: {
      kind: "call_expression",
      has: {
        field: "function",
        regex: "Keypair\\.fromSecretKey"
      }
    }
  });

  for (const node of keypairFromSecretKeyCalls) {
    const args = node.field("arguments");
    if (args) {
      const argsText = args.text().replace(/^\(|\)$/g, ""); // Remove outer parens
      const replacement = `await createKeyPairSignerFromBytes(${argsText})`;
      edits.push(node.replace(replacement));
    }
  }

  // ============================================================
  // 3. keypair.publicKey → keypairSigner.address
  // ============================================================
  const publicKeyAccess = rootNode.findAll({
    rule: {
      kind: "member_expression",
      has: {
        field: "property",
        regex: "^publicKey$"
      }
    }
  });

  for (const node of publicKeyAccess) {
    const objectNode = node.field("object");
    if (objectNode) {
      const objectText = objectNode.text();
      // Only transform if it looks like a keypair variable (avoid false positives)
      if (objectText.toLowerCase().includes("keypair") ||
          objectText.toLowerCase().includes("signer") ||
          objectText === "owner") {
        const replacement = `${objectText}.address`;
        edits.push(node.replace(replacement));
      }
    }
  }

  // ============================================================
  // 4. keypair.secretKey → keypairSigner.privateKey
  // ============================================================
  const secretKeyAccess = rootNode.findAll({
    rule: {
      kind: "member_expression",
      has: {
        field: "property",
        regex: "^secretKey$"
      }
    }
  });

  for (const node of secretKeyAccess) {
    const objectNode = node.field("object");
    if (objectNode) {
      const objectText = objectNode.text();
      const replacement = `${objectText}.privateKey`;
      edits.push(node.replace(replacement));
    }
  }

  // ============================================================
  // 5. new PublicKey(...) → address(...)
  // ============================================================
  const publicKeyConstructors = rootNode.findAll({
    rule: {
      kind: "new_expression",
      has: {
        field: "constructor",
        regex: "^PublicKey$"
      }
    }
  });

  for (const node of publicKeyConstructors) {
    const args = node.field("arguments");
    if (args) {
      const argsText = args.text(); // Keep parens
      const replacement = `address${argsText}`;
      edits.push(node.replace(replacement));
    }
  }

  // ============================================================
  // 6. new Connection(...) → createSolanaRpc(...)
  // ============================================================
  const connectionConstructors = rootNode.findAll({
    rule: {
      kind: "new_expression",
      has: {
        field: "constructor",
        regex: "^Connection$"
      }
    }
  });

  for (const node of connectionConstructors) {
    const args = node.field("arguments");
    if (args) {
      // Extract first argument (RPC URL), ignore config object for now
      const argsText = args.text().replace(/^\(|\)$/g, "");
      const firstArg = argsText.split(",")[0].trim();
      const replacement = `createSolanaRpc(${firstArg})`;
      edits.push(node.replace(replacement));
    }
  }

  // ============================================================
  // 7. connection.method() → rpc.method().send()
  // Pattern: connection.<anything>(...) where it's NOT already .send()
  // ============================================================
  const connectionMethodCalls = rootNode.findAll({
    rule: {
      kind: "call_expression",
      has: {
        field: "function",
        kind: "member_expression"
      }
    }
  });

  for (const node of connectionMethodCalls) {
    const funcNode = node.field("function");
    if (!funcNode) continue;

    const objectNode = funcNode.field("object");
    const propertyNode = funcNode.field("property");

    if (objectNode && propertyNode) {
      const objectText = objectNode.text();
      const propertyText = propertyNode.text();

      // Only transform if object is "connection" or "rpc" and it's not already .send()
      if ((objectText === "connection" || objectText === "rpc") &&
          propertyText !== "send") {
        // Check if parent is already .send() to avoid double-wrapping
        const parent = node.parent();
        const grandparent = parent?.parent();

        let isAlreadyDotSend = false;
        if (grandparent && grandparent.kind() === "member_expression") {
          const gpProperty = grandparent.field("property");
          if (gpProperty && gpProperty.text() === "send") {
            isAlreadyDotSend = true;
          }
        }

        if (!isAlreadyDotSend) {
          const replacement = `${node.text()}.send()`;
          edits.push(node.replace(replacement));
        }
      }
    }
  }

  // ============================================================
  // 8. Update type annotations: Keypair → KeyPairSigner, PublicKey → Address
  // ============================================================
  const typeAnnotations = rootNode.findAll({
    rule: {
      kind: "type_annotation",
      has: {
        kind: "type_identifier",
        regex: "^(Keypair|PublicKey|Connection)$"
      }
    }
  });

  for (const node of typeAnnotations) {
    const typeIdNode = node.find({
      rule: { kind: "type_identifier", regex: "^(Keypair|PublicKey|Connection)$" }
    });

    if (typeIdNode) {
      const typeText = typeIdNode.text();
      let replacement = typeText;

      if (typeText === "Keypair") {
        replacement = "KeyPairSigner";
      } else if (typeText === "PublicKey") {
        replacement = "Address";
      } else if (typeText === "Connection") {
        replacement = "ReturnType<typeof createSolanaRpc>";
      }

      edits.push(typeIdNode.replace(replacement));
    }
  }

  // ============================================================
  // 9. Import statement updates
  // From: import { Keypair, PublicKey, Connection } from "@solana/web3.js"
  // To: import { generateKeyPairSigner, address, createSolanaRpc } from "@solana/web3.js"
  // ============================================================
  const importDeclarations = rootNode.findAll({
    rule: {
      kind: "import_statement",
      has: {
        field: "source",
        regex: "@solana/web3\\.js"
      }
    }
  });

  for (const node of importDeclarations) {
    const sourceNode = node.field("source");
    if (!sourceNode) continue;

    const importText = node.text();

    // Build new import mapping
    let newImport = importText;

    // Replace class names with v2 equivalents
    newImport = newImport.replace(/\bKeypair\b/g, "generateKeyPairSigner, createKeyPairSignerFromBytes, type KeyPairSigner");
    newImport = newImport.replace(/\bPublicKey\b/g, "address, type Address");
    newImport = newImport.replace(/\bConnection\b/g, "createSolanaRpc");

    // Clean up duplicate commas and spaces
    newImport = newImport.replace(/,\s*,/g, ",").replace(/,\s*}/g, " }");

    edits.push(node.replace(newImport));
  }

  // Commit all edits
  if (edits.length === 0) {
    return null; // No changes needed
  }

  return rootNode.commitEdits(edits);
};

export default codemod;
