export const blogContent: Record<string, string> = {
  "cctp-rs": `_How we built an open-source library that's moved millions in USDC across blockchains by Joseph Livesey, Semiotic Engineering_

---

At Semiotic, we often find ourselves building infrastructure that doesn't exist yet. When we needed reliable cross-chain USDC transfers for our treasury management system, we discovered there was no production-ready Rust SDK for Circle's Cross-Chain Transfer Protocol (CCTP). So we built one.

Today, we're excited to share [cctp-rs](https://github.com/semiotic-ai/cctp-rs), a type-safe, production-hardened Rust implementation of CCTP that powers millions of dollars in USDC transfers for our internal systems. With our v1.0.0 release, we're making this battle-tested infrastructure available to the broader Rust and crypto ecosystem.

## The Problem: Bridging at Scale

Our internal Likwid service manages router assets across 15+ blockchain networks. It autonomously monitors routers, liquidates accumulated tokens to USDC via DEX aggregators, and consolidates funds to a treasury on Base. This happens 24/7 without human intervention.

The bridging piece was the missing link. We needed to:

- Transfer USDC from Ethereum, Arbitrum, Optimism, Avalanche, and Polygon to Base
- Handle the full CCTP lifecycle: burn → attestation → mint
- Survive network failures, rate limits, and third-party relayer races
- Maintain complete observability for debugging production issues
- Support both CCTP v1 (legacy) and v2 (with sub-30-second settlements)

Existing TypeScript SDKs weren't suitable for our Rust-native infrastructure. So we built cctp-rs from the ground up.

## Design Philosophy: Type Safety as a Feature

Rust's type system isn't just about memory safety—it's a tool for encoding domain knowledge into your code. We leveraged this extensively:

### Compile-Time Chain Validation

\`\`\`rust
// Chain support is checked at compile time
let domain_id = NamedChain::Arbitrum.cctp_domain_id()?;
let fee_bps = NamedChain::Arbitrum.fast_transfer_fee_bps()?;

// Unsupported chains fail gracefully with typed errors
let err = NamedChain::Fantom.cctp_domain_id();
assert!(matches!(err, Err(CctpError::UnsupportedChain(_))));
\`\`\`

### Version-Specific APIs That Can't Be Misused

CCTP v1 and v2 have fundamentally different attestation lookups. v1 queries by message hash; v2 queries by transaction hash. This is easy to confuse, and the wrong choice means failed mints.

We solved this with separate types:

\`\`\`rust
// V1: Query by message hash
let attestation = Cctp::get_attestation(message_hash, ...).await?;

// V2: Query by transaction hash, returns canonical message
let (message, attestation) = CctpV2Bridge::get_attestation(tx_hash, ...).await?;
\`\`\`

You literally cannot call the wrong method—the compiler won't let you.

### The V2 Nonce Foot-Gun

Here's a subtle bug we caught: CCTP v2's \`MessageSent\` event emits a "template" message with zeros in the nonce field. Circle's attestation service fills in the actual nonce before signing. If you use the message from the logs for minting, it will fail.

Our v2 API handles this automatically:

\`\`\`rust
// get_attestation() always returns the canonical message from Circle's API
let (canonical_message, attestation) = bridge.get_attestation(tx_hash, ...).await?;
// Use canonical_message for minting—it has the correct nonce
\`\`\`

This design choice eliminated an entire class of production bugs.

## Relayer-Aware Design for the Real World

CCTP v2 is permissionless. Once Circle attests a message, _anyone_ can relay it. On mainnet, third-party relayers actively monitor burns and may complete your transfer before your application does.

This isn't a bug; it's a feature of decentralized systems. But it means your code needs to handle races gracefully:

\`\`\`rust
use cctp_rs::{CctpV2Bridge, MintResult};

match bridge.mint_if_needed(message, attestation, from).await? {
    MintResult::Minted(tx_hash) => {
        log::info!("Minted via our relayer: {tx_hash}");
    }
    MintResult::AlreadyRelayed => {
        log::info!("Transfer completed by third-party relayer");
    }
}
\`\`\`

The \`mint_if_needed()\` method checks the on-chain nonce status before attempting a mint, preventing wasted gas and failed transactions.

## Production Hardening: The Details That Matter

### HTTP Timeouts and Retry Logic

\`\`\`rust
let client = Client::builder()
    .timeout(Duration::from_secs(30))
    .build()?;
\`\`\`

We poll Circle's Iris API with configurable retry logic:

- Rate limit handling (429 → sleep 5 minutes)
- 404 responses treated as "pending, retry"
- Configurable max attempts and poll intervals

### Comprehensive Error Types

\`\`\`rust
#[derive(Error, Debug)]
pub enum CctpError {
    UnsupportedChain(NamedChain),
    AlreadyRelayed { original: String },
    AttestationTimeout,
    AttestationFailed { reason: String },
}
\`\`\`

No string-based errors. No panics. Every failure mode has a typed representation.

## The Numbers

- **26+ supported chains** across mainnet and testnet
- **v2.0.0 stable** with semantic versioning
- **Millions of USDC** bridged in production via Likwid

## How Likwid Uses cctp-rs

Our treasury consolidation flow:

1. **Extraction**: Discover tokens accumulated in routers across 15+ chains
2. **Liquidation**: Swap tokens to USDC via Odos aggregator when thresholds are met
3. **Bridging**: Move USDC to Base via CCTP v2
4. **State tracking**: PostgreSQL tracks the full lifecycle (burn → attestation → mint)

## Get Started

\`\`\`toml
[dependencies]
cctp-rs = "2.0.0"
\`\`\`

\`\`\`rust
use cctp_rs::{CctpV2Bridge, CctpError};
use alloy_chains::NamedChain;

let bridge = CctpV2Bridge::builder()
    .source_chain(NamedChain::Mainnet)
    .destination_chain(NamedChain::Base)
    .source_provider(eth_provider)
    .destination_provider(base_provider)
    .recipient(recipient)
    .build();

let burn_tx = burn_usdc(&bridge, amount).await?;
let (message, attestation) = bridge.get_attestation(burn_tx, None, None).await?;
bridge.mint_if_needed(message, attestation, from).await?;
\`\`\`

Check out the [examples](https://github.com/semiotic-ai/cctp-rs/tree/main/examples) for complete working code.

## What's Next

We're continuing to evolve cctp-rs as Circle expands CCTP support:

- New chain additions as Circle announces them
- Performance optimizations for high-frequency use cases
- Enhanced hook support for programmable transfers

The crate is Apache 2.0 licensed and we welcome contributions.

---

_cctp-rs is open source at [github.com/semiotic-ai/cctp-rs](https://github.com/semiotic-ai/cctp-rs). Documentation is available at [docs.rs/cctp-rs](https://docs.rs/cctp-rs)._

_Semiotic AI builds financial infrastructure. Learn more at [semiotic.ai](https://www.semiotic.ai)._`,

  "verifiable-extraction": `The Graph is a decentralized protocol organizing blockchain data for easy access. Indexers maintain this organized data and provide a way for developers, dapps, and data analysts to query the data they need.

In order to provide accurate results and avoid slashing, an Indexer should ensure that the data they are using to respond to queries is correct and reflects the recorded history of the protocol from which it was derived. Here we discuss _Verifiable Extraction_, the process of verifying that data pulled from a blockchain accurately reflects the chain's ledger.

## Sources of Information

An Indexer can retrieve, or _extract_, blocks from a chain for indexing and querying services by different means. These include direct access to an archive node, file sharing among Indexers, or pulling from a central repository of information.

Below we will discuss what it means for blockchain data to be verifiable, how verification can be carried out, and how Semiotic's [veemon](https://github.com/semiotic-ai/veemon) project provides source code in Rust to verify Ethereum blocks.

## Verifiable Data: Integrity and Authentication

When Alice shares a file with Bob, how can Bob trust that the file has not been altered in transit, and that he has the same information that Alice has? Bob needs to verify the _integrity_ of the information. Alice makes a claim involving the file's contents and sends this claim to Bob along with the file. Bob can reconstruct the claim from the information he receives and verify that it matches the one Alice sent.

A useful claim is easy to reconstruct and verify, and should only correspond to the message from which it was constructed. In the context of SNARKs, such a claim is called a _commitment_.

### Example: Hash Functions

A _cryptographic hash function_ is practical for verifying information integrity. This is a function with the following properties:

- The output of the hash function (the _hash_) is a fixed size, regardless of the size of the input.
- It is easy to compute the output, but difficult to find an input for a given output (one-way function).
- Given an input-output pair, it is difficult to construct another input which gives the same output.

A simple example of an integrity verification scheme which typically uses a hash function is a checksum.

With this Alice and Bob example, we have illustrated two necessary components of verifiable data:

1. **Integrity**: The data is correct.
2. **Authentication**: The data came from a trusted source.

## Integrity: Verifying the Contents of the Block

An Indexer using information from a blockchain could extract that information by various means, including from a shared file, a data repository, or by direct RPC request.

StreamingFast's Firehose enables the creation of binary flat files which can be easily shared and archived among Indexers. These flat files generalize execution blocks from multiple chains via Google Protocol Buffer (Protobuf) definitions.

The benefits of using verifiable data—such as Firehose flat files—as a source for Indexers include:

1. Indexers can share files without needing to trust each other
2. An Indexer needs to ensure that the data it provides to an end user has integrity
3. Historical blockchain data must be maintained for developers who require it

The transactions root is calculated by constructing a Merkle tree, which uses a hash function to incorporate information from a group of transactions (the leaves) into a single hash output (the root). Any change in a recorded transaction will result in a change to the commitment.

**1. The contents of the block should be associated with a commitment that can be verified.**

## Authentication: Verifying the Source of the Block

By verifying the contents of the block, an Indexer can ensure that a block is self-consistent. But what is to prevent Alice from changing or omitting a transaction in the original block, recalculating the transactions root and block hash based on this erroneous information?

To address this issue, we need to verify that the block itself came from a trusted source. Our ultimate source of trust here is the blockchain ledger.

**2. The block can be shown to match the blockchain's ledger.**

### Proof of Inclusion in the Chain's History

Similar to how there is a transactions root commitment to a group of transactions, we can construct a commitment to a group of block hashes. A group here is equal to 8,192 block hashes and is called an _era_. By calculating the root of a Merkle tree with these block hashes at the leaves, we create a commitment to this era.

A verifier compares this root to a trusted record of roots for all eras in the Ethereum history. The Portal Network maintains a record of these era-based roots called a Header Accumulator.

## veemon: Verifiable Extraction in Rust

Semiotic Labs maintains source code in Rust to perform verifiable extraction of Ethereum blocks. The [veemon](https://github.com/semiotic-ai/veemon/) repository provides the capability to parse StreamingFast .dbin files containing Ethereum blocks, and to verify the content and history of pre-Merge and post-Merge blocks.

As information from decentralized protocols is extracted by Graph Indexers and served to end users, it is important to ensure that the information is trustworthy. Indexers serving up blockchain records must be able to verify that the data is correct according to the consensus of the blockchain.`,

  "homomorphic-signatures": `_This post was co-authored by Carollan Helinski, Severiano Sisneros, and Pedro Henrique Bufulin de Almeida at Semiotic Labs._

## Introduction

You're a coffee shop owner looking to minimize your costs of doing business. You notice that credit card transaction fees are inflating the price you charge to your customers. So you have an idea: rather than paying with credit card for each transaction, you let your customers pay with an IOU. At the end of the month you tally the customer's IOUs and ask the customer to pay the total amount using a single credit card transaction.

But, what happens if you have a customer who runs up a large tally and then never comes back? It would be great if you could prove that all the IOUs came from the untrustworthy customer and also prove the value of the sum of all the IOUs.

Cryptographers solved the first half of the problem in the early days of public-key cryptography by inventing digital signatures. In this post we're going to talk about how cryptographers solved the full problem using something called a **homomorphic signature scheme**.

Essentially all "homomorphic" means is that if you have two values that are the output of some function and add them together, then the result is the same as first adding the two inputs together and then calculating the function on the sum.

This solution is particularly interesting in blockchain applications, where transaction fees are particularly high. You can submit a single transaction which verifies the homomorphic signature and transfers the amount owed. This is way cheaper than having to submit and verify all the individual signatures and enables interesting protocols like micropayment channels.

This post discusses design and optimization of verifiable micropayments over a state channel, a feature of Semiotic Labs' [GraphTally](https://github.com/semiotic-ai/timeline-aggregation-protocol) library for The Graph.

## Micropayments Using State Channels

An Ethereum-based state channel lets users conduct numerous transactions off-chain without the cost of executing each transaction on the EVM. In the case where transactions are payment transfers (a payment channel), the cost associated with fees can be greatly reduced, especially when the value of each payment is low (a so-called micropayment).

Semiotic Labs' GraphTally provides a library for verifying ECDSA signatures on transactions in a payment channel. The receipt for each micropayment is signed, then verified by the TAP Aggregator. The Aggregator adds together the values of all payments and creates a new signed receipt reflecting the combined value.

Instead of validating each signature individually, we look to homomorphic signature schemes (HSS), where the aggregated signature is a valid signature on the sum of messages. Semiotic Labs has developed a Rust implementation, [h2s2](https://github.com/semiotic-ai/h2s2), of the protocol.

## Homomorphic Signatures for Cheap and Trustless Micropayments

The network coding scheme NCS1 of Boneh et al. is an HSS consisting of four algorithms **Setup**, **Sign**, **Combine**, and **Verify**.

### Cost of Verification

If the values P, Q and R are initialized as part of the smart contract, then the verification of the combination requires:

- A scalar multiplication in G1, which costs 40,000 gas
- A pairing equality check, which costs 260,000 gas

To avoid doing the hash computation on the EVM, the verification smart contract can be initialized with a precomputed value based on the expected number of receipts N.

## Benchmarks

The following benchmarks were conducted on an M2 MacBook Air using our Rust implementation [h2s2](https://github.com/semiotic-ai/h2s2):

- **82μs** to sign a single message
- **1.2ms** to verify a single message
- **58μs** to combine 32 signatures
- **1.1ms** to verify a batch of 32 signatures

The most important thing we notice is that verifying an aggregate signature takes about the same time as verifying a single signature. For blockchain applications, this means we can batch verify any number of signatures and the on-chain costs will be independent of the number of signatures in the batch.

## Conclusion

By leveraging homomorphic signature schemes, we can significantly reduce the computational costs associated with verifying aggregated micropayments, while maintaining the security and integrity of off-chain transactions.`,

  "automated-query-pricing": `## TL;DR

Indexers in The Graph have control over the pricing of the GraphQL queries they serve based on their shape. For this task, The Graph created a domain-specific language called Agora that maps query shapes to prices in GRT. However, manually populating and updating Agora models for each subgraph is a tedious task, and as a consequence, most indexers default to a static, flat pricing model.

To help indexers with pricing in the relative resource cost of serving different query shapes, as well as following the query market price, we are developing **AutoAgora**, an automation tool that automatically creates and updates Agora models.

## Query Relative Cost Discovery

This work is based on a few trends that we have observed through analyzing the query traffic.

### Observations on Received Queries

One of the major problems of GraphQL is its ability to create very computationally expensive queries. In the worst cases, it is even possible to create exponentially hard queries while the query body itself grows only linearly. We can indeed observe this on queries against the Uniswap V2 subgraph, where query execution times span 4 orders of magnitude.

Simultaneously, we observed that a vast majority of the queries are based on a small number of query shapes. This is to be expected as most queries are generated programmatically from web frontends.

Based on the observations above, a reasonable solution for relative query pricing is to estimate the relative cost of the most frequent queries for each subgraph.

### AutoAgora Logging and Relative Costing Infrastructure

All monetized queries coming from the Gateway pass through the \`indexer-service\`. We modified it to output detailed query logs (subgraph hash, query, variables, GRT fees paid, execution time). These logs are then processed to normalize the queries, separate all query values from the query shapes.

Relative pricing is generated periodically from the logs database. For each subgraph, query shapes that have seen more than a threshold number of queries are selected to be included in the Agora model. For each shape, the average query execution time is computed and used as the query shape cost factor in the pricing model.

## Query Market Price Discovery

### The Query Market

In The Graph, each subgraph on each gateway defines a query market, on which end-consumers compete to buy queries and indexers compete to serve queries based on their Agora-defined prices and quality of service.

The objective of the AutoAgora price discovery is to find the \`$GLOBAL_COST_MULTIPLIER\` that optimizes the revenue rate, as well as continuously adjust it to track markets fluctuations.

### AutoAgora Absolute Price Discovery

To find and continuously track the optimal price point requires continuously probing the market "black box" at various price points. The balance between exploration and exploitation is a reinforcement learning problem studied through the multi-armed bandit problem.

We are mapping the price discovery problem as a continuum-armed bandit problem. The policy is modeled as a Gaussian probability distribution over cost multiplier values.

We tested the AutoAgora price discovery on our own indexer (\`semiotic-indexer.eth\`) on mainnet with great success.

## Limitations and Conclusions

Our goal with AutoAgora is to help build sustainable, efficient query markets on The Graph, while also lowering the human operation costs.

Current shortcomings include:
- The relative cost models based only on average query shape execution time are too simplistic
- The initial convergence speed of the market price bandit model is quite slow
- The price bandit training is unstable on subgraphs with low query volumes

The AutoAgora components are open source under the Apache-2 license.`,

  "indexer-allocation-2": `_This article was co-authored by Anirudh Patel, Howard Heaton from Edge & Node, and with Hope Yen from GraphOps._

## TL;DR

Analytically optimizing to maximize indexing rewards may seem like a straightforward solution, but it oversimplifies the complexities involved in an Indexer's decision-making process. In this post, we'll discuss how we enable Indexers to input their preferences into the [Allocation Optimizer](https://github.com/graphprotocol/allocation-optimizer) and how those preferences can impact the Allocation Optimization problem. We'll also explore how we incorporate a gas fee to make the optimization problem more realistic, which results in a non-convex problem.

## Optimizing Over Gas

Gas costs have long been a challenging issue for those seeking to solve web3 optimization problems. We aim to find the set of optimal sparse vectors and then select the specific sparse vector that yields the highest profit. We define profit as the total indexing reward minus the total gas cost.

### The Math At A Glance

We use gradient descent, projected gradient descent, the simplex projection, GSSP (Greedy Selector and Simplex Projector), and Halpern iteration to solve this optimization problem.

The key insight is that adding gas fees makes the originally convex objective function non-convex. This is because we've added a term depending on a binary variable that has value 1 if an allocation is nonzero and 0 otherwise.

For non-convex functions, gradient descent can get stuck at local minima rather than finding the global minimum.

### Solution Approach

We solve the problem with a sparsity constraint for each value k from 1 to the number of subgraphs, giving us the optimal allocation strategy for k allocations. Then, we choose the best of these by picking the one that maximizes profit after accounting for gas costs.

When you run the Allocation Optimizer with \`opt_mode = "fast"\`, this is exactly what the code does!

### Results

| | 100 GRT | 1000 GRT | 10000 GRT |
|---|---|---|---|
| Current Profit | 191,525.88 | 183,425.88 | 102,425.88 |
| Optimized Profit | 540,841.27 | 469,017.12 | 333,127.37 |
| % Increase | 282% | 255% | 325% |

As expected, higher gas costs result in fewer allocations.

## Indexer Preferences

### Filtering Subgraphs

Indexers can specify:
- **Blacklist**: Subgraphs to exclude from optimization
- **Whitelist**: Only allocate to these subgraphs
- **Frozenlist**: Keep existing allocations fixed
- **Pinnedlist**: Ensure minimum allocation on specific subgraphs
- **min_signal**: Filter out subgraphs with signal below a threshold

### Other Preferences

- **allocation_lifetime**: Determines the time frame for token issuance
- **max_allocations**: Limits the number of subgraphs to allocate to

## Conclusion

In Part II, we've demonstrated how the Allocation Optimizer accounts for Indexer preferences and how the fast mode solves the non-convex optimization problem using GSSP and Halpern iteration. However, we did not demonstrate optimality—the Allocation Optimizer also has an optimal flag that we'll cover in our next blog post.

Check out our Julia package [SemioticOpt](https://github.com/semiotic-ai/SemioticOpt.jl) for the optimization techniques described here.`,

  "amm-overview": `## TL;DR

This article explores the principles and mechanisms behind the many popular Automatic Market Maker designs currently used in production. While the mathematical details of these designs are fascinating in their own right, this article seeks to focus on graphical representations and high-level concepts, allowing for a more approachable and exhaustive exploration of the space.

## Introduction

Historically, order books run by professional market makers have been the dominant method used to facilitate exchange. On-chain, maintaining an order book is prohibitively expensive, since storage and computation on distributed ledgers are in short supply and high demand. For this reason, **Automatic Market Makers (AMM)** have emerged as an efficient class of methods to facilitate the exchange of crypto assets.

An AMM leverages smart contracts to allow permissionless participation in market-making. These individuals passively provide liquidity to the contract, which can then use a predetermined function to automatically facilitate exchanges between buyers and sellers.

## Basic Automatic Market Makers

The first and most well-known AMM is the **Constant Product Market Maker (CPMM)**, first released by Bancor and further popularized by Uniswap. The CPMM spreads liquidity out equally between all prices, making it an extremely general solution but also very capital inefficient.

The **Constant Mean Market Maker (CMMM)**, introduced by Balancer Protocol, generalizes the CPMM by allowing the liquidity provider to specify desired portfolio weights, such as a 20%-80% split.

The extreme case is a **Constant Sum Market Maker (CSMM)**, which facilitates exchange at a fixed rate regardless of the current portfolio. This allows for perfect capital efficiency at the selected exchange rate, but quickly leads to losing all of the more valuable assets the moment the price deviates.

## Hybrid Automatic Market Makers

**Curve's StableSwap** interpolates between CPMM and CSMM behavior, maintaining close to a 1:1 exchange rate for pegged assets while never running out of either asset.

**Solidly** builds on Uniswap V2 by adding a quartic sum invariant for stable assets, producing a similar effect to StableSwap.

**Dodo's PMM** (Proactive Market Maker) flattens the price curve around an oracle price with a slippage parameter k that interpolates between constant product (k=1) and constant sum (k=0).

**Clipper** interpolates between constant sum and constant product more explicitly, parameterized by a slippage parameter k.

**Curve's CryptoSwap** expands on StableSwap for volatile assets with additional parameters, dynamic fees, and an internal oracle system.

## Virtual Reserve Automatic Market Makers

**KyberSwap** introduced virtual reserves, multiplying real balances by an amplification factor. This provides much higher capital efficiency but means the market maker can potentially run out of one asset.

**Uniswap V3** allows each liquidity provider to pick their own price range, incentivizing precise price range selection with higher yields.

## Request For Quote Systems

RFQ mechanisms allow for private off-chain pricing with on-chain settlement, bridging DeFi and traditional finance.

## Conclusions

While this list covers many major DEXs, there remain several significant AMMs not covered. With the enormous variation in AMM models, **DEX aggregators** have become essential. [Odos.xyz](https://odos.xyz/) is a DEX aggregator that searches more complex solutions than existing platforms, allowing for atomic multi-input trades and better rates.`,

  "psi-fhe": `_This work was done by Gokay Saldamli and Lisandro (Lichu) Acuña at Semiotic Labs. Special thanks to Jonathan Passerat-Palmbach and the broader Flashbots team for their collaboration._

## Private Set Intersection with Fully Homomorphic Encryption

**Private Set Intersection (PSI)** is a cryptographic technique that enables two parties to identify common elements in their sets without leaking any information about the rest of the elements. This can be used in secure contact tracing during epidemics or in privacy-preserving human genome testing.

Over the last year, Semiotic Labs has been studying PSI applications to blockchain infrastructure problems, particularly in the context of Maximal Extractable Value (MEV). Through discussions with the Flashbots team, we concluded that an efficient PSI protocol could add a lot of value to the field.

### The Math

The protocol uses **Fully Homomorphic Encryption (FHE)** to eliminate reliance on an external server. FHE enables computing directly on encrypted data, preserving data privacy throughout processing.

Our solution is based on Chang et al.'s "Fast Private Set Intersection from Homomorphic Encryption":

0. **Context**: Alice has a set A and Bob has a set B
1. **Setup**: Alice generates a public-secret key pair, sends public key to Bob
2. **Set encryption**: Alice encrypts each element and sends ciphertexts to Bob
3. **Computing intersection**: For each ciphertext, Bob homomorphically computes a product that will be zero only if the element is in the intersection
4. **Reply extraction**: Alice decrypts the results—zeros indicate shared elements

We added an optimization that keeps the circuit depth fixed regardless of set sizes by splitting Bob's set into subsets, allowing PSI on sets of any size.

### The Code

We implemented the protocol using node-seal, a wrapper of Microsoft SEAL. The code is available at our [public GitHub repository](https://github.com/LichuAcu/psi-demo).

### Benchmarks

| Alice's set | Bob's set | Running time |
|---|---|---|
| 100 | 50 | 1,919ms |
| 100 | 100 | 3,811ms |
| 100 | 200 | 7,646ms |
| 100 | 400 | 15,286ms |
| 100 | 800 | 30,496ms |

Runtime grows linearly with Bob's set size, and the separate intersections can be run in parallel.

### Use Cases

- Private access list comparison (EIP-2930)
- Private auctions among MEV extractors
- Private block construction
- Note discovery in Aztec Protocol

### Limitations

The main limitation is that this protocol is designed for only two entities. Extending to n parties would require O(n²) executions.`,

  "crypto-meta-analysis": `## Introduction

Many groups have released 2024 crypto market outlooks this year. We used ChatGPT to summarize those from Messari, VanEck, Pantera Capital, Coinbase Institutional, and a16z crypto. We also include outlooks from Odos, a leading DeFi aggregator spun out of Semiotic.

## Common Themes

The most common themes are Bitcoin, DeFi, Gaming, DeSoc, AI, DePIN, improving user experience, and tokenizing real-world assets (RWAs).

### Bitcoin

Across the reports, there is a uniform view that Bitcoin's dominance is expected to persist, driven by growing institutional interest and validation as a unique digital store of value. The upcoming halving event is highlighted as a potential catalyst for appreciation. There is excitement around a Bitcoin ETF.

### DeFi

DeFi represents just under 0.01% of the $510 trillion value of global financial assets, indicating significant room for expansion. Key trends include:

- **RWA Diversification**: Real World Assets on public blockchains expected to be driven by DeFi natives
- **Bitcoin Layer 2**: Led by Stacks, providing better access to Bitcoin liquidity
- **L2s Capturing DeFi**: Significant adoption of L2 ecosystems with cheaper gas fees
- **Rise of On-Chain Order Books**: An exciting "L2 native" evolution of DeFi

### Gaming

Approximately 3.44 billion gamers globally contribute to an expected $184 billion in revenue. Gen Z and Gen Alpha are particularly engaged, spending around 15 hours a week gaming. Blockchain gaming is predicted to see a title surpassing 1 million daily active users.

### AI

The convergence of AI and crypto is seen as expanding the design horizons of crypto, with three key synergies:
- AI agents utilizing crypto infrastructure
- zkML innovations for smart contracts querying AI models
- Tokenization for rewarding contributions to AI models

### DePIN

DePIN encompasses storage, computing, wireless connectivity, energy networks, and geospatial data collection. The cloud storage market is valued at $80 billion, yet decentralized alternatives cater to less than 0.1% despite offering costs 70% lower.

Notable projects include Filecoin, Storj, Arweave, Hivemapper, and Helium.

### User Experience

Account abstraction (ERC-4337) is simplifying crypto interactions. The upcoming Dencun upgrade is expected to reduce rollup transaction fees by 2-10x. Intents are emerging as a new paradigm for defining blockchain actions.

### NFTs

NFTs are integrating into mainstream brand strategies. Bitcoin-based NFTs through Ordinals are growing. Starbucks, Nike, and Reddit have all launched digital collectible programs.

### DeSoc

Decentralized social platforms like Farcaster and Lens are making strides. Key factors include portable social graphs, anti-censorship, control over algorithms, and creator monetization.

### Tokenizing Real-World Assets

MakerDAO's reserves have shifted towards tokenized treasuries, growing from $40M to nearly $3B. Centrifuge leads the RWA space with $250M in active loans.

## Selected Perspectives

### Messari
Strong long-term case for Bitcoin as a hedge against fiscal irresponsibility. Products to watch: USDT on Tron, BASE from Coinbase, Celestia, Firedancer, Farcaster, Lido, CCIP.

### VanEck
Anticipates U.S. recession in H1 2024. KYC-enabled DeFi apps expected to gain traction. Solana predicted to outperform in market cap and active users.

### Pantera Capital
Emphasizes the 1-Year HODL Wave metric. Suggests significant gains may still be ahead based on historical patterns.

### Coinbase Institutional
Layer-2 solutions growing rapidly. 59% of institutional investors expect allocations to increase. Complex regulatory landscape for stablecoins.

### a16z crypto
Decentralization matters for credibly neutral, open infrastructure. Open-source modular tech stacks unlock permissionless innovation. SNARKs are becoming mainstream for verification.

---

_Disclaimer: This document is for informational purposes only and does not constitute financial, legal, or investment advice._`,

  "indexer-allocation-1": `_This article was co-authored by Anirudh Patel, Howard Heaton from Edge & Node, and with Hope Yen from GraphOps._

### TL;DR

Indexers within The Graph Protocol are rewarded via an indexing reward. How can indexers optimise their allocations so as to maximise the reward they receive? In this blog post we formalise the problem in terms of a reward function and use convex optimization to find a solution.

### Overview

The Graph's goal is to decentralize the API and query layer of web3, enabling users to query blockchain data without a centralized service provider. "Indexers" serve queries to consumers. In this blog post, we focus on the problem of how an indexer should choose which data to index, and thereby, which data to serve.

### The Indexer Allocation Problem

Subgraphs are collections of data extracted from blockchain transactions. Indexers must be selective with which subgraphs they index. The more a subgraph is queried, the more Indexers want to be indexing it.

We rely on **curation**: the outputs of the curation process are subgraph signals, which should be roughly proportional to the volume of queries. The higher the signal on a subgraph, the higher we expect the query volume.

## The Indexing Reward Function

An Indexer i has some stake σᵢ. Each subgraph j has some signal ψⱼ on it. An Indexer's allocation to subgraph j is defined as Ωᵢⱼ. The indexing reward considers both the proportion of signal and the proportion of total allocation on each subgraph.

## Intuition

- The amount we should allocate to a subgraph is roughly a linear function of the signal on that subgraph
- We want to place just enough stake to capture the maximum reward on each subgraph
- When the marginal reward for increasing stake on one subgraph is less than another, we should switch

## Optimizing The Indexing Reward

We want to maximize the indexing reward subject to constraints that allocations must sum to our total stake and can't be negative. Since the indexing reward is a concave function of allocations, we can use convex optimization!

We use the Karush-Kuhn-Tucker conditions to find an analytic solution.

### Results

Running our optimizer for an existing Indexer, we see an improvement in indexing rewards from **208,608.87 GRT to 240,739.72 GRT**. That's an improvement of **15%!**

The optimal allocation allocates to way more subgraphs: the Indexer currently allocates to 70, while the optimal tool allocates to 144.

### Conclusion

The above problem formulation focuses on a simplified version. We haven't yet considered gas costs or resource constraints. These will turn our convex problem into a non-convex problem. The [next post](https://blog-semiotic.ghost.io/indexer-allocation-optimization-part-ii/) discusses how we can optimize this non-convex problem.`,

  "sum-check": `### TL;DR

It is expensive to run transactions on the Ethereum EVM. Verifiable computing (VC) lets us outsource computing away from the EVM. Today, a popular and exciting form of VC algorithm is the SNARK. Various families of SNARKs use the **sum-check protocol**, which is a simple algorithm to introduce VC. This is a tutorial on the sum-check protocol.

You can skip straight to the finished code [here](https://github.com/0xsamgreen/sumcheck).

### Background

Executing code on Ethereum is expensive. Verifiable computing algorithms promise a way to reduce costs, by outsourcing computing to untrusted parties and only verifying the result on-chain. The sum-check protocol is a foundational building block of more sophisticated SNARK algorithms.

The sum-check protocol is used to outsource the computation of a sum of a function g evaluated at all Boolean inputs. It allows a Prover P to convince a Verifier V that P computed the sum correctly.

### The Sum-Check Protocol

The protocol steps are:

1. **Prover P calculates the total sum** of g evaluated at all Boolean inputs
2. **P computes a partial sum**, leaving the first variable x₁ free
3. **Verifier V checks** that the partial sum and total sum agree when evaluated at 0 and 1
4. **V picks a random number r₁** and sends it to P
5. **P replaces the free variable** with r₁ and computes a partial sum leaving x₂ free
6. **Repeat steps 3-5** for all remaining variables
7. **V evaluates g at one input** using an oracle: g(r₁, r₂, ..., rᵥ)
8. **If V's check passes**, V accepts P's proof

### Example

For the function ϕ(x₁,x₂,x₃,x₄) = (NOT x₁ AND x₂) AND (x₃ OR x₄), the arithmetized version is:

g(x₁,x₂,x₃,x₄) = (1-x₁)·x₂·((x₃+x₄)-(x₃·x₄))

The Boolean-to-arithmetic conversion rules:

| Boolean gate | Arithmetized version |
|---|---|
| A AND B | A*B |
| A OR B | (A+B)-(A*B) |
| NOT A | 1-A |

Evaluating g at all 16 Boolean inputs gives g₀ = 3 (the #SAT answer).

The security of sum-check derives from the Schwartz–Zippel lemma—essentially random sampling for quality control. With sum-check, the cost for V drops from 2ᵛ evaluations to just v steps plus a single evaluation of g.

### Conclusions

Python code implementing sum-check can be found in [this repo](https://github.com/0xsamgreen/sumcheck). The Fiat–Shamir transform can make sum-check non-interactive, which is what SNARKs also use.`,
};
