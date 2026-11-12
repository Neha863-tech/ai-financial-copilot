import { Product } from '../types/product';

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod-lap-01',
    title: 'Lenovo IdeaPad Slim 3 Gen 8 (Ryzen 7 7730U, 16GB LPDDR5, 512GB NVMe)',
    brand: 'Lenovo',
    category: 'Laptops',
    price: 54990,
    originalPrice: 68990,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    seller: {
      name: 'OmniTech Authorized Retail (National Partner)',
      rating: 4.7,
      reviewCount: 1420,
      verifiedSeller: true,
      sellerEvidence: 'Official Lenovo India Tier-1 Authorized Partner License #LEN-IND-88219 (Cross-verified in OEM registry)',
      returnPolicyDays: 7,
      warranty: '1 Year Onsite Manufacturer Warranty + ADP Eligible',
      sellerId: 'OMNI-7712'
    },
    verificationScore: 94,
    verificationStatus: 'VERIFIED',
    specs: {
      processor: 'AMD Ryzen 7 7730U (8 Cores, 16 Threads, up to 4.5 GHz)',
      ram: '16GB LPDDR5-4800 (Dual Channel, Soldered)',
      storage: '512GB M.2 PCIe Gen 4 SSD (Upgradable to 1TB)',
      gpu: 'AMD Radeon Graphics 8 CUs (Shared VRAM)',
      display: '15.6" FHD (1920x1080) IPS 300nits Anti-glare, 45% NTSC',
      battery: '47Wh, Rapid Charge Boost (15m charge = 2hr run)',
      weight: '1.62 kg',
      os: 'Windows 11 Home + Office H&S 2021'
    },
    pros: [
      '8 cores / 16 threads provides strong CPU-bound Python & Scikit-learn parallelism',
      'Dual-channel 16GB memory enables local lightweight PyTorch/TensorFlow dataframes',
      'OEM verified seller with valid Indian invoice and official manufacturer warranty',
      'PCIe Gen 4 SSD verified at 3,450 MB/s sequential read'
    ],
    cons: [
      'No discrete NVIDIA CUDA GPU; training CNNs/LLMs must rely on cloud or CPU/OpenVINO',
      'RAM is soldered and cannot be expanded beyond 16GB',
      'Display color gamut limited to 45% NTSC (suboptimal for color-critical design)'
    ],
    suitabilityScore: 91,
    suitabilityReason: 'Optimal pick under ₹60,000 for CS/ML coursework, data science preprocessing, and inference workloads. Discrete CUDA is absent in this budget bracket, but 8-core Zen 3+ CPU and 16GB RAM excel at tabular ML and PyTorch CPU experimentation.',
    evidenceSources: [
      {
        id: 'ev-01',
        title: 'Lenovo PSREF Official Specification Sheet (Model 82XM0055IN)',
        type: 'OEM_SPEC',
        url: 'https://psref.lenovo.com/Detail/IdeaPad_Slim_3_15ABR8',
        verified: true,
        claim: '16GB LPDDR5 & Ryzen 7 7730U',
        finding: 'Verified: Dual-channel 16GB 4800MHz verified in official Lenovo product datasheet.',
        lastChecked: '2026-10-24'
      },
      {
        id: 'ev-02',
        title: 'Geekbench 6 Cross-Platform Benchmark Registry',
        type: 'BENCHMARK',
        url: 'https://browser.geekbench.com/v6/cpu/compare/7730u',
        verified: true,
        claim: 'Multi-core compute score > 6,800',
        finding: 'Verified: Multi-core benchmark averages 7,120 across 412 test submissions.',
        lastChecked: '2026-10-24'
      },
      {
        id: 'ev-03',
        title: 'PriceTrack 90-Day E-Commerce Scrape History',
        type: 'PRICE_HISTORY',
        url: 'https://pricetrack.demo.internal/history/lap-01',
        verified: true,
        claim: 'Genuine discount from ₹58,990',
        finding: 'Verified: Average 90-day price was ₹57,400. Current ₹54,990 is a true 4.2% dip.',
        lastChecked: '2026-10-24'
      }
    ],
    verifiedFacts: [
      'AMD Ryzen 7 7730U 8C/16T confirmed via OEM PSREF',
      '16GB LPDDR5 memory running in dual channel configuration',
      'Seller registered with GSTIN 29AAACX1209M1ZG and active manufacturer dispatch authorization',
      'Official 1-Year Lenovo India warranty verifiable at support.lenovo.com'
    ],
    unknowns: [
      'Exact SSD manufacturer brand varies by batch (Micron or Kingston OEM)',
      'Linux kernel 6.5+ ACPI sleep-state compatibility not officially tested by OEM'
    ],
    shippingSupported: true,
    estimatedShipping: 0,
    shippingNote: 'Free express courier delivery supported with live tracking (seller-fulfilled via BlueDart)',
    taxSupported: true,
    estimatedTax: 9898, // 18% GST included in base listing price
    taxNote: 'Price inclusive of 18% Indian GST (₹8,388 verified tax component on invoice)',
    isDemo: true
  },
  {
    id: 'prod-lap-02',
    title: 'Acer Aspire Lite 12th Gen Intel Core i5-1235U (16GB RAM, 512GB SSD, Metal Body)',
    brand: 'Acer',
    category: 'Laptops',
    price: 46990,
    originalPrice: 59990,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80',
    seller: {
      name: 'SuperTech Digital Retail LLP',
      rating: 4.4,
      reviewCount: 890,
      verifiedSeller: true,
      sellerEvidence: 'Registered Acer Direct Sub-Distributor (GSTIN: 27AABCS3321N1ZL)',
      returnPolicyDays: 7,
      warranty: '1 Year International Travelers Warranty',
      sellerId: 'SUPER-4401'
    },
    verificationScore: 88,
    verificationStatus: 'VERIFIED',
    specs: {
      processor: 'Intel Core i5-1235U (10 Cores: 2P + 8E, 12 Threads, up to 4.4 GHz)',
      ram: '16GB DDR4-3200 (Dual Channel, Expandable to 32GB)',
      storage: '512GB NVMe SSD (2x M.2 Slots available)',
      gpu: 'Intel Iris Xe Graphics (80 EUs)',
      display: '15.6" Full HD (1920 x 1080) Slim Bezel',
      battery: '36Wh 3-cell Li-ion (approx 4.5 hours under code build)',
      weight: '1.59 kg',
      os: 'Windows 11 Home'
    },
    pros: [
      'Expandable RAM up to 32GB (crucial for heavier dataset loading in pandas)',
      'Substantial cost savings: ₹13,000 below your ₹60,000 budget cap',
      'Dual M.2 SSD slots allow adding a second dedicated Linux/ML drive',
      '10-core heterogeneous architecture handles multitasking smoothly'
    ],
    cons: [
      'Smaller 36Wh battery leads to shorter battery life under heavy compiling',
      'U-series Intel chips throttle sustained multi-threaded rendering after 15 mins',
      'No discrete GPU'
    ],
    suitabilityScore: 86,
    suitabilityReason: 'High value pick if RAM upgradability to 32GB is a priority. Excellent budget headroom (₹46,990), freeing funds for cloud GPU compute (Google Colab Pro or RunPod) for ML experiments.',
    evidenceSources: [
      {
        id: 'ev-04',
        title: 'Acer Official Store Hardware Documentation (AL15-52)',
        type: 'OEM_SPEC',
        url: 'https://store.acer.com/en-in/aspire-lite-al15-52',
        verified: true,
        claim: 'Dual RAM slots with up to 32GB DDR4 upgrade path',
        finding: 'Verified: Motherboard contains 2x SO-DIMM slots.',
        lastChecked: '2026-10-24'
      },
      {
        id: 'ev-05',
        title: 'UL Procyon AI Inference Benchmark DB',
        type: 'BENCHMARK',
        url: 'https://benchmarks.ul.com/hardware/cpu/intel-i5-1235u',
        verified: true,
        claim: 'Intel OpenVINO acceleration on Iris Xe',
        finding: 'Verified: OpenVINO INT8 model inference achieves 42 fps on MobileNetV2.',
        lastChecked: '2026-10-24'
      }
    ],
    verifiedFacts: [
      'Dual memory slots officially confirmed upgradable to 32GB',
      'Intel Iris Xe 80 EUs supported by OpenVINO runtime',
      'Authorized seller GST registration validated against tax portal'
    ],
    unknowns: [
      'Exact fan noise decibel level under continuous 100% CPU thread burn-in',
      'Display refresh rate is fixed at 60Hz'
    ],
    shippingSupported: true,
    estimatedShipping: 0,
    shippingNote: 'Free standard delivery in 2-3 business days',
    taxSupported: true,
    estimatedTax: 7167,
    taxNote: '18% GST breakdown verified against seller catalog',
    isDemo: true
  },
  {
    id: 'prod-lap-03',
    title: 'ASUS TUF Gaming A15 (Ryzen 5 7535HS, RTX 2050 4GB GPU, 16GB DDR5, 512GB SSD)',
    brand: 'ASUS',
    category: 'Laptops',
    price: 59990,
    originalPrice: 75990,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
    seller: {
      name: 'PrimeHardware Warehouse Store',
      rating: 4.2,
      reviewCount: 310,
      verifiedSeller: false,
      sellerEvidence: 'Third-party marketplace merchant. Reseller certificate pending annual re-verification.',
      returnPolicyDays: 7,
      warranty: '1 Year Brand Warranty (User must register serial number manually)',
      sellerId: 'PRIME-9021'
    },
    verificationScore: 76,
    verificationStatus: 'CAUTION',
    specs: {
      processor: 'AMD Ryzen 5 7535HS (6 Cores, 12 Threads, 35W-45W TDP)',
      ram: '16GB DDR5-4800 (2x 8GB SO-DIMM slots)',
      storage: '512GB PCIe 4.0 NVMe M.2 SSD',
      gpu: 'NVIDIA GeForce RTX 2050 (4GB GDDR6 dedicated VRAM, 70W TGP)',
      display: '15.6" FHD 144Hz IPS-level Display, Adaptive-Sync',
      battery: '48Wh Li-ion',
      weight: '2.30 kg (Heavy power adapter: 550g)',
      os: 'Windows 11 Home'
    },
    pros: [
      'Dedicated NVIDIA RTX 2050 GPU with CUDA cores and Tensor cores for PyTorch / TensorFlow',
      'Allows training small vision models and local LLM quantization (4-bit via bitsandbytes)',
      'High refresh 144Hz display and military-grade durability chassis',
      'Dual upgradable DDR5 memory slots'
    ],
    cons: [
      'Seller is unverified on manufacturer tier-1 registry — risk of delayed RMA claims',
      '4GB VRAM limits maximum batch sizes in deep learning models',
      'Heavy carry weight (2.3 kg + power brick) compared to ultrabooks',
      'Price sits right on the upper edge of the ₹60,000 threshold'
    ],
    suitabilityScore: 89,
    suitabilityReason: 'Only laptop in this price range with genuine NVIDIA CUDA hardware acceleration for deep learning models. However, the seller is a third-party merchant requiring caution, and 4GB VRAM will require gradient accumulation or small batch sizes.',
    evidenceSources: [
      {
        id: 'ev-06',
        title: 'NVIDIA CUDA Compute Capability Document (Architecture Ampere GA107)',
        type: 'OEM_SPEC',
        url: 'https://developer.nvidia.com/cuda-gpus',
        verified: true,
        claim: 'CUDA Compute Capability 8.6 supported',
        finding: 'Verified: RTX 2050 possesses 2,048 CUDA cores and supports CUDA 12+ and PyTorch cuDNN.',
        lastChecked: '2026-10-24'
      },
      {
        id: 'ev-07',
        title: 'Marketplace Seller Compliance Scrutiny',
        type: 'SELLER_REGISTRY',
        url: 'https://trustcart.internal/audit/prime-9021',
        verified: false,
        claim: 'Official ASUS Direct Warranty coverage',
        finding: 'Caution: Merchant listed as secondary reseller. Serial numbers must be verified upon delivery.',
        lastChecked: '2026-10-24'
      }
    ],
    verifiedFacts: [
      'NVIDIA RTX 2050 4GB GPU confirmed with CUDA Capability 8.6',
      'Ryzen 5 7535HS runs at higher sustained 45W TDP suitable for compilation',
      'Dual DDR5 memory slots allow future 32GB/64GB expansion'
    ],
    unknowns: [
      'Whether the seller includes sealed OEM outer packaging or open-box unit',
      'Precise remaining manufacturer warranty window if factory dispatch occurred >90 days ago'
    ],
    shippingSupported: true,
    estimatedShipping: 499,
    shippingNote: 'Heavy parcel courier surcharge: ₹499 (Insurance coverage included)',
    taxSupported: true,
    estimatedTax: 9151,
    taxNote: '18% GST verified based on standard electronics HSN code 84713010',
    isDemo: true
  },
  {
    id: 'prod-lap-04',
    title: 'HP 15s-eq2144AU (Ryzen 5 5500U, 16GB DDR4, 512GB SSD, Alexa Built-in)',
    brand: 'HP',
    category: 'Laptops',
    price: 43990,
    originalPrice: 52000,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
    seller: {
      name: 'Apex Infotech Solutions',
      rating: 4.5,
      reviewCount: 2210,
      verifiedSeller: true,
      sellerEvidence: 'HP India Authorized Commercial Dealer #HP-DL-004128',
      returnPolicyDays: 10,
      warranty: '1 Year HP Onsite Warranty',
      sellerId: 'APEX-1188'
    },
    verificationScore: 92,
    verificationStatus: 'VERIFIED',
    specs: {
      processor: 'AMD Ryzen 5 5500U (6 Cores, 12 Threads, Zen 2 architecture)',
      ram: '16GB DDR4-3200 (2x 8GB)',
      storage: '512GB PCIe NVMe M.2 SSD',
      gpu: 'AMD Radeon Graphics (7 Cores)',
      display: '15.6" diagonal FHD micro-edge anti-glare (250 nits)',
      battery: '41Wh with HP Fast Charge (50% in 45 min)',
      weight: '1.69 kg',
      os: 'Windows 11 Home'
    },
    pros: [
      'Extremely economical at ₹43,990 for a 16GB RAM laptop',
      'Well-reviewed thermal management for prolonged office and coding sessions',
      'Verified HP dealer with 10-day replacement window'
    ],
    cons: [
      'Uses older Zen 2 CPU architecture (slower IPC than Zen 3/3+ in Lenovo)',
      'No discrete GPU for local deep learning models',
      'Display brightness is 250 nits (hard to see outdoors)'
    ],
    suitabilityScore: 82,
    suitabilityReason: 'Solid baseline for budget-conscious learners who want 16GB out of the box for general software engineering and classical ML (SVMs, Random Forests, XGBoost).',
    evidenceSources: [
      {
        id: 'ev-08',
        title: 'HP QuickSpecs Technical Overview',
        type: 'OEM_SPEC',
        url: 'https://h20195.www2.hp.com/v2/GetDocument.aspx',
        verified: true,
        claim: '16GB DDR4 and dual-channel layout',
        finding: 'Verified: 2x 8GB DDR4-3200 SODIMMs fitted.',
        lastChecked: '2026-10-24'
      }
    ],
    verifiedFacts: [
      'Ryzen 5 5500U with 6 physical cores and 12 logical threads verified',
      'Official HP India distributor credentials validated',
      '10-day replacement window guaranteed by seller agreement'
    ],
    unknowns: [
      'Fan noise curves under simultaneous CPU and SSD saturation'
    ],
    shippingSupported: true,
    estimatedShipping: 0,
    shippingNote: 'Free express shipping across all pin codes',
    taxSupported: true,
    estimatedTax: 6710,
    taxNote: 'All taxes inclusive under GST HSN 8471',
    isDemo: true
  },
  {
    id: 'prod-lap-05',
    title: 'Dell Inspiron 3520 (12th Gen Intel i3-1215U, 8GB RAM, 512GB SSD) [UNVERIFIED MATCH]',
    brand: 'Dell',
    category: 'Laptops',
    price: 36990,
    originalPrice: 44990,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
    seller: {
      name: 'QuickDeal Hub Deals (Grey Market Importer)',
      rating: 3.2,
      reviewCount: 48,
      verifiedSeller: false,
      sellerEvidence: 'No manufacturer authorized partner credentials found. Registered as general retail entity.',
      returnPolicyDays: 0,
      warranty: 'Seller Warranty Only (30 Days)',
      sellerId: 'GREY-009'
    },
    verificationScore: 48,
    verificationStatus: 'UNVERIFIED',
    specs: {
      processor: 'Intel Core i3-1215U (6 Cores: 2P + 4E, 8 Threads)',
      ram: '8GB DDR4 (Single Channel - DOES NOT MEET 16GB ML REQUIREMENT)',
      storage: '512GB NVMe SSD',
      gpu: 'Intel UHD Graphics',
      display: '15.6" FHD 120Hz WVA Display',
      battery: '41Wh',
      weight: '1.65 kg',
      os: 'Windows 11 Home'
    },
    pros: [
      'Low initial entry price of ₹36,990',
      '120Hz display refresh rate'
    ],
    cons: [
      'FAILS CRITERIA: Only 8GB RAM in single channel (causes memory swapping during ML workflows)',
      'Unverified seller with only 30-day seller warranty (no official Dell warranty)',
      '0-day return policy — non-returnable once opened',
      'Weak multi-core compute for parallel data processing'
    ],
    suitabilityScore: 35,
    suitabilityReason: 'NOT RECOMMENDED for Machine Learning. Misses the 16GB requirement by half, seller offers no manufacturer warranty, and return policy is zero days.',
    evidenceSources: [
      {
        id: 'ev-09',
        title: 'Dell Official Support Hardware Configuration Check',
        type: 'OEM_SPEC',
        url: 'https://www.dell.com/support/home/en-in',
        verified: true,
        claim: 'Ships with 8GB RAM single stick',
        finding: 'Verified: Base unit contains only 1x 8GB SODIMM.',
        lastChecked: '2026-10-24'
      },
      {
        id: 'ev-10',
        title: 'Consumer Protection Seller Scrutiny Notice',
        type: 'SELLER_REGISTRY',
        url: 'https://trustcart.internal/audit/grey-009',
        verified: false,
        claim: 'Dell manufacturer warranty claim on marketplace listing',
        finding: 'REFUTED: Dell warranty lookup database shows device registered as refurbished import.',
        lastChecked: '2026-10-24'
      }
    ],
    verifiedFacts: [
      'Intel i3-1215U CPU contains only 2 Performance cores'
    ],
    unknowns: [
      'Prior refurbishment status or cosmetic grading of imported unit',
      'Whether official Dell Service Centers in India will accept the serial tag'
    ],
    shippingSupported: false,
    shippingNote: 'Carrier rates unknown until seller dispatch confirmation is generated',
    taxSupported: false,
    taxNote: 'Tax breakdown not verified; seller invoice lacks verified GST registration ID',
    isDemo: true
  }
];

export const CATEGORIES = [
  'All Categories',
  'Laptops',
  'Smartphones',
  'Audio',
  'Monitors',
  'Components'
];

export const EXAMPLE_SEARCHES = [
  'Find a laptop under ₹60,000 for machine learning with 16GB RAM',
  'Compare noise-cancelling headphones under ₹15,000 with multipoint Bluetooth',
  'Best 4K 144Hz monitor under ₹35,000 with USB-C 65W charging for Mac',
  'Smartphone under ₹25,000 with optical image stabilization and clean Android'
];
