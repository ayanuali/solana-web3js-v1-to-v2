# Metaplex JS → Umi Migration Codemod

Automated migration tool for upgrading from `@metaplex-foundation/js` to the modern `@metaplex-foundation/umi` framework.

## What it does

This codemod handles the following transformations:

### 1. Initialization
```typescript
// Before
const metaplex = Metaplex.make(connection);

// After
const umi = createUmi(endpoint).use(mplTokenMetadata());
```

### 2. Finding NFTs
```typescript
// Before
const nft = await metaplex.nfts().findByMint({ mintAddress });

// After
const nft = await fetchDigitalAsset(umi, mintAddress);
```

### 3. Creating NFTs
```typescript
// Before
const { nft } = await metaplex.nfts().create({
  name: 'My NFT',
  uri: 'https://...',
  sellerFeeBasisPoints: 500,
});

// After
const nft = await createNft(umi, {
  mint: generateSigner(umi),
  name: 'My NFT',
  uri: 'https://...',
  sellerFeeBasisPoints: percentAmount(5),
}).sendAndConfirm(umi);
```

### 4. Updating NFTs
```typescript
// Before
await metaplex.nfts().update({
  nftOrSft: mintAddress,
  name: 'Updated Name',
});

// After
await updateV1(umi, {
  mint: mintAddress,
  authority: umi.identity,
  data: { ...asset.metadata, name: 'Updated Name' },
}).sendAndConfirm(umi);
```

### 5. Uploading Metadata
```typescript
// Before
const { uri } = await metaplex.nfts().uploadMetadata(metadata);

// After
const uri = await umi.uploader.uploadJson(metadata);
```

### 6. PublicKey Handling
```typescript
// Before
const publicKey = new PublicKey('address...');

// After
const key = publicKey('address...');
```

## Usage

Run this codemod on your project:

```bash
npx codemod metaplex-js-to-umi
```

Or with a specific path:

```bash
npx codemod metaplex-js-to-umi /path/to/your/project
```

## Migration Strategy

The codemod uses a 3-stage pipeline:

1. **AST Transform** (80-90% automation) - Deterministic pattern matching and replacement
2. **AI Fixups** (10-20% remaining) - GPT-4o handles complex edge cases
3. **Prettier** - Code formatting

## Package Updates

After running the codemod, update your package.json:

```bash
npm uninstall @metaplex-foundation/js
npm install @metaplex-foundation/umi-bundle-defaults @metaplex-foundation/mpl-token-metadata @metaplex-foundation/umi
```

## Known Limitations

- Custom plugin configurations may need manual adjustment
- Complex wallet adapters might require manual intervention
- Some advanced Metaplex patterns may need review

## Test Fixtures

See `tests/fixtures/` for before/after examples covering:
- Basic NFT lookup
- NFT creation
- NFT updates
- Metadata uploads
- Class-based patterns

## Author

Ayan Uali <ayanuali@gmail.com>

## License

MIT
