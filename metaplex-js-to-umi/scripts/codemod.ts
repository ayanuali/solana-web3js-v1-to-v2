/**
 * Metaplex JS → Umi Migration Codemod
 *
 * Automates migration from @metaplex-foundation/js to @metaplex-foundation/umi
 * Handles: Metaplex.make() → createUmi(), NFT operations, metadata uploads, PublicKey conversions
 */

import type { Codemod, Edit } from "codemod:ast-grep";
import type TSX from "codemod:ast-grep/langs/tsx";

const codemod: Codemod<TSX> = async (root) => {
  const rootNode = root.root();
  const edits: Edit[] = [];

  // Track which imports we need to add
  const importsToAdd = new Set<string>();

  // ============================================================
  // 1. Metaplex.make() → createUmi()
  // ============================================================
  const metaplexMakeCalls = rootNode.findAll({
    rule: {
      kind: "call_expression",
      has: {
        field: "function",
        regex: "Metaplex\\.make"
      }
    }
  });

  for (const node of metaplexMakeCalls) {
    const args = node.field("arguments");
    if (args) {
      const argsText = args.text().replace(/^\(|\)$/g, ""); // Remove outer parens
      // createUmi expects endpoint, then plugins
      const replacement = `createUmi(${argsText}).use(mplTokenMetadata())`;
      edits.push(node.replace(replacement));
      importsToAdd.add("createUmi");
      importsToAdd.add("mplTokenMetadata");
    }
  }

  // ============================================================
  // 2. metaplex.nfts().findByMint() → fetchDigitalAsset()
  // ============================================================
  const findByMintCalls = rootNode.findAll({
    rule: {
      kind: "call_expression",
      pattern: "$OBJ.nfts().findByMint($ARGS)"
    }
  });

  for (const node of findByMintCalls) {
    const objMatch = node.getMatch("OBJ");
    const argsMatch = node.getMatch("ARGS");
    
    if (objMatch && argsMatch) {
      const objText = objMatch.text();
      const argsText = argsMatch.text();
      
      // Determine umi variable name (usually umi, but could be the object name)
      const umiVar = objText === "metaplex" ? "umi" : objText;
      
      const replacement = `await fetchDigitalAsset(${umiVar}, ${argsText})`;
      edits.push(node.replace(replacement));
      importsToAdd.add("fetchDigitalAsset");
    }
  }

  // ============================================================
  // 3. metaplex.nfts().create() → createNft().sendAndConfirm()
  // ============================================================
  const createNftCalls = rootNode.findAll({
    rule: {
      kind: "call_expression",
      pattern: "$OBJ.nfts().create($ARGS)"
    }
  });

  for (const node of createNftCalls) {
    const objMatch = node.getMatch("OBJ");
    const argsMatch = node.getMatch("ARGS");
    
    if (objMatch && argsMatch) {
      const objText = objMatch.text();
      const argsText = argsMatch.text();
      
      const umiVar = objText === "metaplex" ? "umi" : objText;
      
      // In Umi, create expects (umi, config)
      const replacement = `await createNft(${umiVar}, ${argsText}).sendAndConfirm(${umiVar})`;
      edits.push(node.replace(replacement));
      importsToAdd.add("createNft");
    }
  }

  // ============================================================
  // 4. metaplex.nfts().update() → updateV1().sendAndConfirm()
  // ============================================================
  const updateNftCalls = rootNode.findAll({
    rule: {
      kind: "call_expression",
      pattern: "$OBJ.nfts().update($ARGS)"
    }
  });

  for (const node of updateNftCalls) {
    const objMatch = node.getMatch("OBJ");
    const argsMatch = node.getMatch("ARGS");
    
    if (objMatch && argsMatch) {
      const objText = objMatch.text();
      const argsText = argsMatch.text();
      
      const umiVar = objText === "metaplex" ? "umi" : objText;
      
      const replacement = `await updateV1(${umiVar}, ${argsText}).sendAndConfirm(${umiVar})`;
      edits.push(node.replace(replacement));
      importsToAdd.add("updateV1");
    }
  }

  // ============================================================
  // 5. metaplex.nfts().uploadMetadata() → umi.uploader.uploadJson()
  // ============================================================
  const uploadMetadataCalls = rootNode.findAll({
    rule: {
      kind: "call_expression",
      pattern: "$OBJ.nfts().uploadMetadata($ARGS)"
    }
  });

  for (const node of uploadMetadataCalls) {
    const objMatch = node.getMatch("OBJ");
    const argsMatch = node.getMatch("ARGS");
    
    if (objMatch && argsMatch) {
      const objText = objMatch.text();
      const argsText = argsMatch.text();
      
      const umiVar = objText === "metaplex" ? "umi" : objText;
      
      const replacement = `await ${umiVar}.uploader.uploadJson(${argsText})`;
      edits.push(node.replace(replacement));
    }
  }

  // ============================================================
  // 6. new PublicKey() → publicKey()
  // ============================================================
  const publicKeyConstructors = rootNode.findAll({
    rule: {
      kind: "new_expression",
      pattern: "new PublicKey($ARGS)"
    }
  });

  for (const node of publicKeyConstructors) {
    const argsMatch = node.getMatch("ARGS");
    
    if (argsMatch) {
      const argsText = argsMatch.text();
      const replacement = `publicKey(${argsText})`;
      edits.push(node.replace(replacement));
      importsToAdd.add("publicKey");
    }
  }

  // ============================================================
  // 7. Update imports: @metaplex-foundation/js → Umi packages
  // ============================================================
  const metaplexImports = rootNode.findAll({
    rule: {
      kind: "import_statement",
      pattern: "import $IMPORTS from '@metaplex-foundation/js'"
    }
  });

  for (const node of metaplexImports) {
    // Replace the import with Umi equivalents
    const newImport = `import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplTokenMetadata, fetchDigitalAsset, createNft, updateV1 } from '@metaplex-foundation/mpl-token-metadata';
import { publicKey } from '@metaplex-foundation/umi';`;
    
    edits.push(node.replace(newImport));
  }

  // ============================================================
  // 8. Handle Metaplex type annotations → Umi
  // ============================================================
  const metaplexTypeAnnotations = rootNode.findAll({
    rule: {
      kind: "type_annotation",
      pattern: ": Metaplex"
    }
  });

  for (const node of metaplexTypeAnnotations) {
    edits.push(node.replace(": Umi"));
    importsToAdd.add("Umi");
  }

  // ============================================================
  // 9. Metaplex variable type in declarations
  // ============================================================
  const metaplexVariableDeclarations = rootNode.findAll({
    rule: {
      kind: "variable_declarator",
      has: {
        field: "type",
        pattern: "Metaplex"
      }
    }
  });

  for (const node of metaplexVariableDeclarations) {
    const typeNode = node.field("type");
    if (typeNode && typeNode.text() === "Metaplex") {
      edits.push(typeNode.replace("Umi"));
      importsToAdd.add("Umi");
    }
  }

  // ============================================================
  // 10. Update PublicKey imports from @solana/web3.js to Umi
  // ============================================================
  const solanaPublicKeyImports = rootNode.findAll({
    rule: {
      kind: "import_statement",
      has: {
        field: "source",
        regex: "@solana/web3\\.js"
      },
      has: {
        field: "import_clause",
        regex: "PublicKey"
      }
    }
  });

  for (const node of solanaPublicKeyImports) {
    // Check if only PublicKey is imported, or if there are other imports
    const importText = node.text();
    
    if (importText.includes("{ PublicKey }") && !importText.includes(",")) {
      // Only PublicKey, replace entire import
      edits.push(node.replace("import { publicKey } from '@metaplex-foundation/umi';"));
    } else {
      // Multiple imports, just remove PublicKey from the list
      // This is complex - we will let AI handle it in step 2
    }
  }

  // Apply all edits
  return edits;
};

export default codemod;
