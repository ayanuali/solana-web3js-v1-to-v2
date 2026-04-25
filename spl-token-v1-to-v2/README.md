# SPL Token v0.1.x → v0.2+ Codemod

Automates migration from `@solana/spl-token` v0.1.x (Token class-based API) to v0.2+ (standalone functions API).

## Overview

This codemod transforms the old class-based Token API to the new functional API introduced in `@solana/spl-token` v0.2+. The migration includes:

- Removing `Token` class instantiations
- Converting static methods to standalone functions
- Transforming instance methods to standalone function calls
- Updating imports to remove `Token` and add specific function imports
- Removing empty signer arrays (`[]`) that are no longer needed

## Migration Coverage

### Token Class Instantiation
**Before:**
```typescript
const token = new Token(connection, mintAddress, TOKEN_PROGRAM_ID, payer);
```

**After:**
```typescript
// Token instance removed - using standalone functions
```

### Static Methods

#### Token.createMint()
**Before:**
```typescript
const mint = await Token.createMint(connection, payer, authority, freezeAuthority, decimals, TOKEN_PROGRAM_ID);
```

**After:**
```typescript
const mint = await createMint(connection, payer, authority, freezeAuthority, decimals, TOKEN_PROGRAM_ID);
```

#### Token.getAssociatedTokenAddress()
**Before:**
```typescript
const ata = await Token.getAssociatedTokenAddress(
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  mint,
  owner
);
```

**After:**
```typescript
const ata = await getAssociatedTokenAddress(mint, owner);
```

### Instance Methods

#### token.createAccount()
**Before:**
```typescript
const account = await token.createAccount(owner);
```

**After:**
```typescript
const account = await createAccount(connection, payer, mint, owner);
```

#### token.transfer()
**Before:**
```typescript
await token.transfer(source, dest, owner, [], amount);
```

**After:**
```typescript
await transfer(connection, payer, source, dest, owner, amount);
```

#### token.mintTo()
**Before:**
```typescript
await token.mintTo(dest, authority, [], amount);
```

**After:**
```typescript
await mintTo(connection, payer, mint, dest, authority, amount);
```

#### token.burn()
**Before:**
```typescript
await token.burn(account, owner, [], amount);
```

**After:**
```typescript
await burn(connection, payer, account, mint, owner, amount);
```

#### token.approve()
**Before:**
```typescript
await token.approve(account, delegate, owner, [], amount);
```

**After:**
```typescript
await approve(connection, payer, account, delegate, owner, amount);
```

#### token.revoke()
**Before:**
```typescript
await token.revoke(account, owner, []);
```

**After:**
```typescript
await revoke(connection, payer, account, owner);
```

#### token.getAccountInfo()
**Before:**
```typescript
const info = await token.getAccountInfo(account);
```

**After:**
```typescript
const info = await getAccount(connection, account);
```

#### token.getMintInfo()
**Before:**
```typescript
const mintInfo = await token.getMintInfo();
```

**After:**
```typescript
const mintInfo = await getMint(connection, mint);
```

#### token.createAssociatedTokenAccount()
**Before:**
```typescript
const ata = await token.createAssociatedTokenAccount(owner);
```

**After:**
```typescript
const ata = await createAssociatedTokenAccount(connection, payer, mint, owner);
```

### Import Updates

**Before:**
```typescript
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
```

**After:**
```typescript
import {
  createMint,
  createAccount,
  transfer,
  mintTo,
  burn,
  approve,
  revoke,
  getAccount,
  getMint,
  createAssociatedTokenAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";
```

## Pipeline Architecture

### Step 1: JSSG Transform (scripts/codemod.ts)
Deterministic AST transformations using `ast-grep`:
- Tracks Token instance variables and their associated mint addresses
- Pattern matches and replaces all Token class methods
- Updates import statements
- Removes Token instantiations

### Step 2: AI Fixups (GPT-4o)
Handles complex patterns that require context-aware transformations:
- Edge cases with complex variable scoping
- Nested function calls
- Dynamic property access
- Ensures `connection` and `payer` variables are available

### Step 3: Prettier Formatting
Ensures consistent code style across all modified files.

## Test Fixtures

The codemod includes 6 comprehensive test fixture pairs:

1. **01-create-mint** - Token.createMint() transformation
2. **02-create-account** - token.createAccount() transformation  
3. **03-transfer** - token.transfer() transformation
4. **04-mint-to** - token.mintTo() transformation
5. **05-get-account-info** - token.getAccountInfo() and token.getMintInfo() transformations
6. **06-full-workflow** - Complete real-world example with multiple operations

## Usage

```bash
# From the parent directory
cd ~/solana-web3js-v1-to-v2

# Run the codemod on your project
codemod run spl-token-v1-to-v2 --target /path/to/your/project
```

## Key Changes to Note

1. **Connection and Payer Parameters**: All v0.2+ functions require explicit `connection` and `payer` parameters
2. **Mint Parameter**: Methods that previously used the Token instance now require the mint address as a parameter
3. **No More Empty Arrays**: The `[]` parameter (for multi-signers) has been removed from most functions
4. **Simplified ATA**: `getAssociatedTokenAddress()` now only requires `mint` and `owner` parameters

## Author

Ayan Uali <ayanuali@gmail.com>

## License

MIT
