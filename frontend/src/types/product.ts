export type VerificationStatus = 'VERIFIED' | 'CAUTION' | 'UNVERIFIED';

export type EvidenceType =
  | 'OEM_SPEC'
  | 'BENCHMARK'
  | 'RETURN_POLICY'
  | 'PRICE_HISTORY'
  | 'SELLER_REGISTRY'
  | 'CERTIFICATE';

export interface EvidenceSource {
  id: string;
  title: string;
  type: EvidenceType;
  url: string;
  verified: boolean;
  claim: string;
  finding: string;
  lastChecked: string;
}

export interface SellerInfo {
  name: string;
  rating: number;
  reviewCount: number;
  verifiedSeller: boolean;
  sellerEvidence: string;
  returnPolicyDays: number;
  warranty: string;
  sellerId: string;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: 'Laptops' | 'Smartphones' | 'Audio' | 'Monitors' | 'Components';
  price: number;
  originalPrice?: number;
  currency: string;
  imageUrl: string;
  seller: SellerInfo;
  verificationScore: number; // 0 to 100
  verificationStatus: VerificationStatus;
  specs: {
    processor?: string;
    ram?: string;
    storage?: string;
    gpu?: string;
    display?: string;
    battery?: string;
    weight?: string;
    os?: string;
    [key: string]: string | number | boolean | undefined;
  };
  pros: string[];
  cons: string[];
  suitabilityScore: number; // 0 to 100
  suitabilityReason: string;
  evidenceSources: EvidenceSource[];
  verifiedFacts: string[];
  unknowns: string[]; // Critical missing or unverified data points
  shippingSupported: boolean;
  estimatedShipping?: number;
  shippingNote?: string;
  taxSupported: boolean;
  estimatedTax?: number;
  taxNote?: string;
  isDemo: boolean;
}

export interface SearchFilters {
  query: string;
  category: string;
  maxBudget: number | null;
  onlyVerified: boolean;
  minVerificationScore: number;
  sortBy: 'suitability' | 'price-asc' | 'price-desc' | 'verification';
}
