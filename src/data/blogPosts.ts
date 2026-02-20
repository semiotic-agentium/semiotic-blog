import cctpImg from "@/assets/blog/cctp-rs.png";
import verifiableImg from "@/assets/blog/verifiable-extraction.png";
import homomorphicImg from "@/assets/blog/homomorphic-signatures.png";
import queryPricingImg from "@/assets/blog/automated-query-pricing.png";
import indexer2Img from "@/assets/blog/indexer-part-2.png";
import ammImg from "@/assets/blog/automatic-market-maker.png";
import psiImg from "@/assets/blog/psi-with-fhe.png";
import cryptoImg from "@/assets/blog/crypto-meta-analysis.png";
import indexer1Img from "@/assets/blog/indexer-part-1.png";
import sumCheckImg from "@/assets/blog/sum-check.png";

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  url: string;
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    id: "cctp-rs",
    title: "Building cctp-rs: A Production-Grade Rust SDK for Cross-Chain USDC Transfers",
    excerpt: "How we built an open-source library that's moved millions in USDC across blockchains. At Semiotic, we often find ourselves building infrastructure that doesn't exist yet.",
    category: "Payments & Settlement",
    image: cctpImg,
    url: "https://blog-semiotic.ghost.io/building-cctp-rs-a-production-grade-rust-sdk-for-cross-chain-usdc-transfers/",
    featured: true,
  },
  {
    id: "verifiable-extraction",
    title: "Verifiable Extraction in The Graph",
    excerpt: "We discuss the methodology that Semiotic Labs uses to verify that blockchain data extracted from some source matches the history of the chain.",
    category: "Cryptography & Security",
    image: verifiableImg,
    url: "https://blog-semiotic.ghost.io/verifiable-extraction-in-the-graph/",
  },
  {
    id: "homomorphic-signatures",
    title: "Homomorphic Signatures for Payment Channels",
    excerpt: "This post discusses design and optimization of verifiable micropayments over a state channel, a feature of Semiotic Labs' GraphTally library for The Graph.",
    category: "Cryptography & Security",
    image: homomorphicImg,
    url: "https://blog-semiotic.ghost.io/homomorphic-signatures-for-payment-channels/",
  },
  {
    id: "automated-query-pricing",
    title: "Automated Query Pricing in The Graph",
    excerpt: "To help indexers with pricing in the relative resource cost of serving different query shapes, we are developing AutoAgora, an automation tool.",
    category: "AI & Optimization",
    image: queryPricingImg,
    url: "https://blog-semiotic.ghost.io/automated-query-pricing-in-the-graph/",
  },
  {
    id: "indexer-allocation-2",
    title: "Indexer Allocation Optimization: Part II",
    excerpt: "How can we enable Indexers to input their preferences into the Allocation Optimizer and how do those preferences impact the optimization problem?",
    category: "Optimization",
    image: indexer2Img,
    url: "https://blog-semiotic.ghost.io/indexer-allocation-optimization-part-ii/",
  },
  {
    id: "amm-overview",
    title: "An Overview of Automatic Market Maker Mechanisms",
    excerpt: "This article explores the principles and mechanisms behind the many popular AMM designs currently used in production, with graphical representations.",
    category: "DeFi",
    image: ammImg,
    url: "https://blog-semiotic.ghost.io/an-overview-of-automatic-market-maker-mechanisms/",
  },
  {
    id: "psi-fhe",
    title: "PSI with FHE",
    excerpt: "Private Set Intersection is a cryptographic technique that allows two parties to identify shared information without leaking any other data.",
    category: "Cryptography & Security",
    image: psiImg,
    url: "https://blog-semiotic.ghost.io/psi-with-fhe/",
  },
  {
    id: "crypto-meta-analysis",
    title: "2024 Crypto Meta-Analysis",
    excerpt: "We used ChatGPT to summarize crypto market outlooks from Messari, VanEck, Pantera Capital, Coinbase Institutional, a16z crypto, and Odos.",
    category: "Research",
    image: cryptoImg,
    url: "https://blog-semiotic.ghost.io/2024-crypto-meta-analysis/",
  },
  {
    id: "indexer-allocation-1",
    title: "Indexer Allocation Optimization: Part I",
    excerpt: "How can indexers optimise their allocations so as to maximise the reward they receive? We formalise the problem and use convex optimization.",
    category: "Optimization",
    image: indexer1Img,
    url: "https://blog-semiotic.ghost.io/indexer-allocation-optimization-part-i/",
  },
  {
    id: "sum-check",
    title: "Introduction to the Sum-Check Protocol",
    excerpt: "Verifiable computing lets us outsource computing away from the EVM. Various families of SNARKs use the sum-check protocol, a simple VC algorithm.",
    category: "Cryptography & Security",
    image: sumCheckImg,
    url: "https://blog-semiotic.ghost.io/introduction-to-the-sum-check-protocol/",
  },
];
