export const INITIAL_MULTI_AGENT_STATE = {
    runId: 'run-hackathon-demo-01',
    status: 'completed',
    currentQuery: 'Find a laptop under ₹60,000 for machine learning with 16GB RAM',
    startTime: '2026-10-24T13:10:00Z',
    completedTime: '2026-10-24T13:10:04Z',
    activeAgentId: 'verification',
    overallConfidence: 94,
    summary: 'Evaluated 5 candidates across 3 major e-commerce platforms. Disqualified 1 product for disguised 8GB RAM specs and lack of OEM warranty. Recommends Lenovo IdeaPad Slim 3 for best multi-threaded compute or ASUS TUF A15 if dedicated CUDA acceleration is mandatory.',
    isSimulatedDemo: true,
    agents: {
        research: {
            id: 'research',
            name: 'Research Agent',
            role: 'Hardware Specs & Data Aggregation',
            description: 'Crawls official OEM datasheets, Geekbench CPU/GPU clusters, and retail listings to confirm baseline hardware configuration.',
            status: 'completed',
            progress: 100,
            color: '#38BDF8', // electric blue
            glowColor: 'rgba(56, 189, 248, 0.4)',
            position3D: [-2.4, 1.4, 0],
            currentTask: 'Ingestion complete: 18 datasheets verified against OEM specifications.',
            metrics: {
                claimsChecked: 42,
                sourcesScraped: 18,
                discrepanciesFound: 3,
                confidenceScore: 98,
                dataPointsAnalyzed: 144
            },
            logs: [
                {
                    id: 'log-res-1',
                    timestamp: '13:10:00.120',
                    agentId: 'research',
                    level: 'info',
                    message: 'Initiated targeted query for 16GB RAM laptops under INR 60,000 constraint.',
                    evidenceSnippet: 'Filter: price <= 60000, ram >= 16GB, category == Laptops'
                },
                {
                    id: 'log-res-2',
                    timestamp: '13:10:01.050',
                    agentId: 'research',
                    level: 'success',
                    message: 'Parsed Lenovo PSREF 82XM0055IN. Confirmed AMD Ryzen 7 7730U 8C/16T and 16GB LPDDR5.',
                    sourceUrl: 'https://psref.lenovo.com/Detail/IdeaPad_Slim_3_15ABR8'
                },
                {
                    id: 'log-res-3',
                    timestamp: '13:10:01.890',
                    agentId: 'research',
                    level: 'warn',
                    message: 'Flagged Dell Inspiron listing claiming 16GB; actual hardware specs state single 8GB stick with empty slot.',
                    evidenceSnippet: 'Listing title mismatch: "Dell Inspiron 16GB Ready" vs OEM SKU "8GB Installed"'
                }
            ]
        },
        comparison: {
            id: 'comparison',
            name: 'Comparison Agent',
            role: 'Matrix & Suitability Modeling',
            description: 'Weights machine learning suitability: CPU thread count, RAM bandwidth, GPU Tensor cores, and thermal TDP headroom.',
            status: 'completed',
            progress: 100,
            color: '#A855F7', // violet
            glowColor: 'rgba(168, 85, 247, 0.4)',
            position3D: [2.4, 1.4, 0],
            currentTask: 'Suitability ranking complete. Normalized score: Lenovo 91/100, ASUS TUF 89/100.',
            metrics: {
                claimsChecked: 36,
                sourcesScraped: 12,
                discrepanciesFound: 2,
                confidenceScore: 93,
                dataPointsAnalyzed: 96
            },
            logs: [
                {
                    id: 'log-comp-1',
                    timestamp: '13:10:02.100',
                    agentId: 'comparison',
                    level: 'info',
                    message: 'Applied ML workload matrix weights: CPU Cores (30%), RAM Bandwidth (35%), GPU/CUDA (25%), Thermals (10%).'
                },
                {
                    id: 'log-comp-2',
                    timestamp: '13:10:02.720',
                    agentId: 'comparison',
                    level: 'success',
                    message: 'Comparison matrix populated for top 4 candidates.',
                    evidenceSnippet: 'Lenovo IdeaPad ranks highest in CPU multi-threading (Ryzen 7 7730U 8C/16T). ASUS TUF ranks highest in Deep Learning parallelism (RTX 2050 CUDA cores).'
                }
            ]
        },
        verification: {
            id: 'verification',
            name: 'Verification Agent',
            role: 'Evidence, Warranties & Seller Audit',
            description: 'Audits seller GST registrations, OEM partner tier certificates, return policy enforceability, and counterfeit risk.',
            status: 'completed',
            progress: 100,
            color: '#10B981', // emerald green
            glowColor: 'rgba(16, 185, 129, 0.4)',
            position3D: [-2.4, -1.4, 0],
            currentTask: 'Verified 4 authorized merchant credentials; flagged 1 unverified reseller with 0-day return policy.',
            metrics: {
                claimsChecked: 29,
                sourcesScraped: 9,
                discrepanciesFound: 1,
                confidenceScore: 96,
                dataPointsAnalyzed: 58
            },
            logs: [
                {
                    id: 'log-ver-1',
                    timestamp: '13:10:03.010',
                    agentId: 'verification',
                    level: 'info',
                    message: 'Cross-referencing OmniTech seller GSTIN against Indian Ministry of Corporate Affairs database.',
                    evidenceSnippet: 'GSTIN: 29AAACX1209M1ZG -> ACTIVE status, verified OEM distributor.'
                },
                {
                    id: 'log-ver-2',
                    timestamp: '13:10:03.450',
                    agentId: 'verification',
                    level: 'error',
                    message: 'Audit alert: QuickDeal Hub lacks manufacturer warranty backing; marked as UNVERIFIED.',
                    sourceUrl: 'https://paypal.com/demo/audit/grey-009'
                },
                {
                    id: 'log-ver-3',
                    timestamp: '13:10:03.820',
                    agentId: 'verification',
                    level: 'success',
                    message: 'Verification seals stamped for Lenovo IdeaPad (Score: 94) and Acer Aspire (Score: 88).'
                }
            ]
        },
        budget: {
            id: 'budget',
            name: 'Budget Agent',
            role: 'Pricing Integrity & Total Cost Audit',
            description: 'Calculates price histories, hidden carrier surcharges, GST components, and fair-value indices.',
            status: 'completed',
            progress: 100,
            color: '#F59E0B', // amber
            glowColor: 'rgba(245, 158, 11, 0.4)',
            position3D: [2.4, -1.4, 0],
            currentTask: 'Budget compliance verified. All recommendations strictly <= INR 60,000 threshold.',
            metrics: {
                claimsChecked: 24,
                sourcesScraped: 14,
                discrepanciesFound: 1,
                confidenceScore: 95,
                dataPointsAnalyzed: 72
            },
            logs: [
                {
                    id: 'log-bud-1',
                    timestamp: '13:10:03.900',
                    agentId: 'budget',
                    level: 'info',
                    message: 'Verifying 90-day price trends. Lenovo IdeaPad ₹54,990 is ₹2,410 below average historical mean.'
                },
                {
                    id: 'log-bud-2',
                    timestamp: '13:10:04.110',
                    agentId: 'budget',
                    level: 'warn',
                    message: 'Shipping fee alert: ASUS TUF includes ₹499 carrier surcharge. Effective total: ₹60,489 (₹489 above cap if shipping added).',
                    evidenceSnippet: 'Flagged for explicit user approval before checkout.'
                },
                {
                    id: 'log-bud-3',
                    timestamp: '13:10:04.280',
                    agentId: 'budget',
                    level: 'success',
                    message: 'Tax components validated: 18% GST verified with proper invoice breakdown.'
                }
            ]
        },
        recommendation: {
            id: 'recommendation',
            name: 'Recommendation Agent',
            role: 'Consensus Synthesis & Final Scoring',
            description: 'Synthesizes multi-agent verdicts into an evidence-backed ranking and rationale.',
            status: 'completed',
            progress: 100,
            color: '#EC4899',
            glowColor: 'rgba(236, 72, 153, 0.4)',
            position3D: [0, -2.2, 0],
            currentTask: 'Consensus synthesis complete: Lenovo IdeaPad Slim 3 recommended.',
            metrics: {
                claimsChecked: 38,
                sourcesScraped: 16,
                discrepanciesFound: 0,
                confidenceScore: 94,
                dataPointsAnalyzed: 120,
            },
            logs: [
                {
                    id: 'log-rec-1',
                    timestamp: '13:10:04.350',
                    agentId: 'recommendation',
                    level: 'info',
                    message: 'Synthesizing evidence across Research, Comparison, Verification, and Budget agents.',
                    evidenceSnippet: 'Consensus score: 94% confidence, verified OEM license backing.',
                },
                {
                    id: 'log-rec-2',
                    timestamp: '13:10:04.510',
                    agentId: 'recommendation',
                    level: 'success',
                    message: 'Top evidence recommendation formulated: Lenovo IdeaPad Slim 3 Gen 8.',
                    evidenceSnippet: 'Price: ₹54,990 | 8C/16T Ryzen 7 7730U | Dual-channel 16GB RAM',
                },
            ],
        },
    }
};
