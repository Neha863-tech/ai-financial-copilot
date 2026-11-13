export const INITIAL_DEMO_ORDERS = [
    {
        id: 'TC-ORD-90812',
        productId: 'prod-lap-01',
        productTitle: 'Lenovo IdeaPad Slim 3 Gen 8 (Ryzen 7 7730U, 16GB LPDDR5, 512GB NVMe)',
        productCategory: 'Laptops',
        productImageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
        sellerName: 'OmniTech Authorized Retail (National Partner)',
        sellerVerified: true,
        amount: 54990,
        shippingFee: 0,
        taxFee: 9898,
        totalAmount: 54990,
        currency: 'INR',
        status: 'captured',
        date: '2026-10-23T14:22:10Z',
        paymentGateway: 'paypal_sandbox',
        paypalOrderId: 'SANDBOX-CAPTURE-88192X',
        paypalPayerEmail: 'buyer-sandbox@finsight.ai',
        isDemo: true,
        verificationSnapshot: {
            score: 94,
            warningsAcknowledged: [
                'RAM is soldered LPDDR5 and not user upgradable beyond 16GB',
                'Display color gamut is 45% NTSC'
            ],
            explicitUserApproval: true,
            approvalTimestamp: '2026-10-23T14:21:40Z',
            verifiedSellerConfirmed: true,
            notes: 'Passed automated multi-agent audit with 94% verification score.'
        }
    },
    {
        id: 'TC-ORD-90455',
        productId: 'prod-lap-02',
        productTitle: 'Acer Aspire Lite 12th Gen Intel Core i5-1235U (16GB RAM, 512GB SSD)',
        productCategory: 'Laptops',
        productImageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80',
        sellerName: 'SuperTech Digital Retail LLP',
        sellerVerified: true,
        amount: 46990,
        shippingFee: 0,
        taxFee: 7167,
        totalAmount: 46990,
        currency: 'INR',
        status: 'pending',
        date: '2026-10-24T11:05:32Z',
        paymentGateway: 'paypal_sandbox',
        paypalOrderId: 'SANDBOX-PENDING-44102Y',
        paypalPayerEmail: 'buyer-test2@finsight.ai',
        isDemo: true,
        verificationSnapshot: {
            score: 88,
            warningsAcknowledged: [
                'Battery capacity is 36Wh (approx 4.5 hrs battery life)'
            ],
            explicitUserApproval: true,
            approvalTimestamp: '2026-10-24T11:04:15Z',
            verifiedSellerConfirmed: true,
            notes: 'Awaiting PayPal sandbox buyer capture completion.'
        }
    }
];
