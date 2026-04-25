/**
 * SPL Token v0.1.x → v0.2+ Migration Codemod
 *
 * Automates migration from @solana/spl-token v0.1.x (Token class) to v0.2+ (standalone functions)
 * Handles: Token class instantiation, static methods, instance methods, imports
 */

import type { Codemod, Edit } from "codemod:ast-grep";
import type TSX from "codemod:ast-grep/langs/tsx";

const codemod: Codemod<TSX> = async (root) => {
  const rootNode = root.root();
  const edits: Edit[] = [];

  // Track Token instances to map variable names to their mint addresses
  const tokenInstances = new Map<string, string>();

  // ============================================================
  // 1. Find all Token instantiations and track them
  // ============================================================
  const tokenConstructors = rootNode.findAll({
    rule: {
      kind: "new_expression",
      has: {
        field: "constructor",
        regex: "^Token$"
      }
    }
  });

  for (const node of tokenConstructors) {
    // Extract the variable name and mint address
    const parent = node.parent();
    if (parent && parent.kind() === "variable_declarator") {
      const nameNode = parent.field("name");
      const argsNode = node.field("arguments");
      
      if (nameNode && argsNode) {
        const varName = nameNode.text();
        const args = argsNode.text().replace(/^\(|\)$/g, "").split(",").map(s => s.trim());
        
        // Args: connection, mint, TOKEN_PROGRAM_ID, payer
        if (args.length >= 2) {
          const mintAddr = args[1];
          tokenInstances.set(varName, mintAddr);
        }
        
        // Mark the entire variable declaration for removal
        const statement = parent.parent();
        if (statement) {
          edits.push(statement.replace("// Token instance removed - using standalone functions"));
        }
      }
    }
  }

  // ============================================================
  // 2. Token.createMint() → createMint()
  // ============================================================
  const createMintCalls = rootNode.findAll({
    rule: {
      kind: "call_expression",
      has: {
        field: "function",
        regex: "Token\\.createMint"
      }
    }
  });

  for (const node of createMintCalls) {
    const argsNode = node.field("arguments");
    if (argsNode) {
      const args = argsNode.text().replace(/^\(|\)$/g, "");
      const replacement = `createMint(${args})`;
      edits.push(node.replace(replacement));
    }
  }

  // ============================================================
  // 3. Token.getAssociatedTokenAddress() → getAssociatedTokenAddress()
  // ============================================================
  const getATACalls = rootNode.findAll({
    rule: {
      kind: "call_expression",
      has: {
        field: "function",
        regex: "Token\\.getAssociatedTokenAddress"
      }
    }
  });

  for (const node of getATACalls) {
    const argsNode = node.field("arguments");
    if (argsNode) {
      const args = argsNode.text().replace(/^\(|\)$/g, "").split(",").map(s => s.trim());
      // Old: ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, owner
      // New: mint, owner (simplified in v0.2+)
      if (args.length >= 4) {
        const mint = args[2];
        const owner = args[3];
        const replacement = `getAssociatedTokenAddress(${mint}, ${owner})`;
        edits.push(node.replace(replacement));
      }
    }
  }

  // ============================================================
  // 4. token.createAccount(owner) → createAccount(connection, payer, mint, owner)
  // ============================================================
  const createAccountCalls = rootNode.findAll({
    rule: {
      kind: "call_expression",
      pattern: "$TOKEN.createAccount($OWNER)"
    }
  });

  for (const node of createAccountCalls) {
    const funcNode = node.field("function");
    if (funcNode && funcNode.kind() === "member_expression") {
      const objectNode = funcNode.field("object");
      const argsNode = node.field("arguments");
      
      if (objectNode && argsNode) {
        const tokenVar = objectNode.text();
        const owner = argsNode.text().replace(/^\(|\)$/g, "");
        const mint = tokenInstances.get(tokenVar) || `${tokenVar}Mint`;
        
        const replacement = `createAccount(connection, payer, ${mint}, ${owner})`;
        edits.push(node.replace(replacement));
      }
    }
  }

  // ============================================================
  // 5. token.transfer(source, dest, owner, [], amount) → transfer(connection, payer, source, dest, owner, amount)
  // ============================================================
  const transferCalls = rootNode.findAll({
    rule: {
      kind: "call_expression",
      pattern: "$TOKEN.transfer($$$ARGS)"
    }
  });

  for (const node of transferCalls) {
    const funcNode = node.field("function");
    if (funcNode && funcNode.kind() === "member_expression") {
      const propertyNode = funcNode.field("property");
      if (propertyNode && propertyNode.text() === "transfer") {
        const objectNode = funcNode.field("object");
        const argsNode = node.field("arguments");
        
        if (objectNode && argsNode && tokenInstances.has(objectNode.text())) {
          const args = argsNode.text().replace(/^\(|\)$/g, "").split(",").map(s => s.trim());
          // Old: source, dest, owner, [], amount
          // New: connection, payer, source, dest, owner, amount (remove empty array)
          if (args.length >= 4) {
            const source = args[0];
            const dest = args[1];
            const owner = args[2];
            const amount = args.length >= 5 ? args[4] : args[3];
            
            const replacement = `transfer(connection, payer, ${source}, ${dest}, ${owner}, ${amount})`;
            edits.push(node.replace(replacement));
          }
        }
      }
    }
  }

  // ============================================================
  // 6. token.mintTo(dest, authority, [], amount) → mintTo(connection, payer, mint, dest, authority, amount)
  // ============================================================
  const mintToCalls = rootNode.findAll({
    rule: {
      kind: "call_expression",
      pattern: "$TOKEN.mintTo($$$ARGS)"
    }
  });

  for (const node of mintToCalls) {
    const funcNode = node.field("function");
    if (funcNode && funcNode.kind() === "member_expression") {
      const propertyNode = funcNode.field("property");
      if (propertyNode && propertyNode.text() === "mintTo") {
        const objectNode = funcNode.field("object");
        const argsNode = node.field("arguments");
        
        if (objectNode && argsNode) {
          const tokenVar = objectNode.text();
          const mint = tokenInstances.get(tokenVar) || `${tokenVar}Mint`;
          const args = argsNode.text().replace(/^\(|\)$/g, "").split(",").map(s => s.trim());
          
          // Old: dest, authority, [], amount
          // New: connection, payer, mint, dest, authority, amount
          if (args.length >= 3) {
            const dest = args[0];
            const authority = args[1];
            const amount = args.length >= 4 ? args[3] : args[2];
            
            const replacement = `mintTo(connection, payer, ${mint}, ${dest}, ${authority}, ${amount})`;
            edits.push(node.replace(replacement));
          }
        }
      }
    }
  }

  // ============================================================
  // 7. token.burn(account, owner, [], amount) → burn(connection, payer, account, mint, owner, amount)
  // ============================================================
  const burnCalls = rootNode.findAll({
    rule: {
      kind: "call_expression",
      pattern: "$TOKEN.burn($$$ARGS)"
    }
  });

  for (const node of burnCalls) {
    const funcNode = node.field("function");
    if (funcNode && funcNode.kind() === "member_expression") {
      const propertyNode = funcNode.field("property");
      if (propertyNode && propertyNode.text() === "burn") {
        const objectNode = funcNode.field("object");
        const argsNode = node.field("arguments");
        
        if (objectNode && argsNode) {
          const tokenVar = objectNode.text();
          const mint = tokenInstances.get(tokenVar) || `${tokenVar}Mint`;
          const args = argsNode.text().replace(/^\(|\)$/g, "").split(",").map(s => s.trim());
          
          // Old: account, owner, [], amount
          // New: connection, payer, account, mint, owner, amount
          if (args.length >= 3) {
            const account = args[0];
            const owner = args[1];
            const amount = args.length >= 4 ? args[3] : args[2];
            
            const replacement = `burn(connection, payer, ${account}, ${mint}, ${owner}, ${amount})`;
            edits.push(node.replace(replacement));
          }
        }
      }
    }
  }

  // ============================================================
  // 8. token.approve(account, delegate, owner, [], amount) → approve(connection, payer, account, delegate, owner, amount)
  // ============================================================
  const approveCalls = rootNode.findAll({
    rule: {
      kind: "call_expression",
      pattern: "$TOKEN.approve($$$ARGS)"
    }
  });

  for (const node of approveCalls) {
    const funcNode = node.field("function");
    if (funcNode && funcNode.kind() === "member_expression") {
      const propertyNode = funcNode.field("property");
      if (propertyNode && propertyNode.text() === "approve") {
        const objectNode = funcNode.field("object");
        const argsNode = node.field("arguments");
        
        if (objectNode && argsNode && tokenInstances.has(objectNode.text())) {
          const args = argsNode.text().replace(/^\(|\)$/g, "").split(",").map(s => s.trim());
          
          // Old: account, delegate, owner, [], amount
          // New: connection, payer, account, delegate, owner, amount
          if (args.length >= 4) {
            const account = args[0];
            const delegate = args[1];
            const owner = args[2];
            const amount = args.length >= 5 ? args[4] : args[3];
            
            const replacement = `approve(connection, payer, ${account}, ${delegate}, ${owner}, ${amount})`;
            edits.push(node.replace(replacement));
          }
        }
      }
    }
  }

  // ============================================================
  // 9. token.revoke(account, owner, []) → revoke(connection, payer, account, owner)
  // ============================================================
  const revokeCalls = rootNode.findAll({
    rule: {
      kind: "call_expression",
      pattern: "$TOKEN.revoke($$$ARGS)"
    }
  });

  for (const node of revokeCalls) {
    const funcNode = node.field("function");
    if (funcNode && funcNode.kind() === "member_expression") {
      const propertyNode = funcNode.field("property");
      if (propertyNode && propertyNode.text() === "revoke") {
        const objectNode = funcNode.field("object");
        const argsNode = node.field("arguments");
        
        if (objectNode && argsNode && tokenInstances.has(objectNode.text())) {
          const args = argsNode.text().replace(/^\(|\)$/g, "").split(",").map(s => s.trim());
          
          // Old: account, owner, []
          // New: connection, payer, account, owner
          if (args.length >= 2) {
            const account = args[0];
            const owner = args[1];
            
            const replacement = `revoke(connection, payer, ${account}, ${owner})`;
            edits.push(node.replace(replacement));
          }
        }
      }
    }
  }

  // ============================================================
  // 10. token.getAccountInfo(account) → getAccount(connection, account)
  // ============================================================
  const getAccountInfoCalls = rootNode.findAll({
    rule: {
      kind: "call_expression",
      pattern: "$TOKEN.getAccountInfo($ACCOUNT)"
    }
  });

  for (const node of getAccountInfoCalls) {
    const funcNode = node.field("function");
    if (funcNode && funcNode.kind() === "member_expression") {
      const objectNode = funcNode.field("object");
      const argsNode = node.field("arguments");
      
      if (objectNode && argsNode && tokenInstances.has(objectNode.text())) {
        const account = argsNode.text().replace(/^\(|\)$/g, "");
        const replacement = `getAccount(connection, ${account})`;
        edits.push(node.replace(replacement));
      }
    }
  }

  // ============================================================
  // 11. token.getMintInfo() → getMint(connection, mint)
  // ============================================================
  const getMintInfoCalls = rootNode.findAll({
    rule: {
      kind: "call_expression",
      pattern: "$TOKEN.getMintInfo()"
    }
  });

  for (const node of getMintInfoCalls) {
    const funcNode = node.field("function");
    if (funcNode && funcNode.kind() === "member_expression") {
      const objectNode = funcNode.field("object");
      
      if (objectNode) {
        const tokenVar = objectNode.text();
        const mint = tokenInstances.get(tokenVar) || `${tokenVar}Mint`;
        const replacement = `getMint(connection, ${mint})`;
        edits.push(node.replace(replacement));
      }
    }
  }

  // ============================================================
  // 12. token.createAssociatedTokenAccount(owner) → createAssociatedTokenAccount(connection, payer, mint, owner)
  // ============================================================
  const createATACalls = rootNode.findAll({
    rule: {
      kind: "call_expression",
      pattern: "$TOKEN.createAssociatedTokenAccount($OWNER)"
    }
  });

  for (const node of createATACalls) {
    const funcNode = node.field("function");
    if (funcNode && funcNode.kind() === "member_expression") {
      const objectNode = funcNode.field("object");
      const argsNode = node.field("arguments");
      
      if (objectNode && argsNode) {
        const tokenVar = objectNode.text();
        const mint = tokenInstances.get(tokenVar) || `${tokenVar}Mint`;
        const owner = argsNode.text().replace(/^\(|\)$/g, "");
        
        const replacement = `createAssociatedTokenAccount(connection, payer, ${mint}, ${owner})`;
        edits.push(node.replace(replacement));
      }
    }
  }

  // ============================================================
  // 13. Update imports: Remove Token, add specific functions
  // ============================================================
  const importDeclarations = rootNode.findAll({
    rule: {
      kind: "import_statement",
      has: {
        field: "source",
        regex: "@solana/spl-token"
      }
    }
  });

  for (const node of importDeclarations) {
    const specifiersNode = node.field("import_clause");
    if (specifiersNode) {
      const currentImports = specifiersNode.text();
      
      // Remove Token class from imports
      let newImports = currentImports.replace(/,?\s*Token\s*,?/g, ",").replace(/,,/g, ",").trim();
      
      // Add commonly used v0.2+ functions if not already present
      const functionsToAdd = [
        "createMint",
        "createAccount", 
        "transfer",
        "mintTo",
        "burn",
        "approve",
        "revoke",
        "getAccount",
        "getMint",
        "createAssociatedTokenAccount",
        "getAssociatedTokenAddress"
      ];
      
      for (const func of functionsToAdd) {
        if (!newImports.includes(func)) {
          newImports = newImports.replace("{", `{ ${func},`);
        }
      }
      
      // Clean up formatting
      newImports = newImports.replace(/{\s*,/g, "{").replace(/,\s*}/g, "}").replace(/,\s*,/g, ",");
      
      const fullImport = `import ${newImports} from "@solana/spl-token";`;
      edits.push(node.replace(fullImport));
    }
  }

  return edits;
};

export default codemod;
