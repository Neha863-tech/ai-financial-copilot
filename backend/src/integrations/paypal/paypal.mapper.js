export const paypalMapper = {
  mapReportingTransaction(detail) {
    try {
      const info = detail.transaction_info;
      const payer = detail.payer_info;

      if (!info) return null;

      const amount = Math.abs(parseFloat(info.transaction_amount?.value || '0'));
      const currency = info.transaction_amount?.currency_code || 'USD';
      const isIncome = parseFloat(info.transaction_amount?.value || '0') > 0;

      let status = 'COMPLETED';
      const txnStatus = info.transaction_status;
      if (txnStatus === 'P') status = 'PENDING';
      else if (txnStatus === 'V') status = 'CANCELLED';
      else if (txnStatus === 'F' || txnStatus === 'D') status = 'FAILED';

      return {
        source: 'PAYPAL_REPORTING',
        externalId: info.transaction_id,
        merchant: payer?.payer_name?.alternate_full_name || info.payee_display_metadata?.merchant_name || 'PayPal Transaction',
        description: info.transaction_subject || info.transaction_note || `PayPal ${isIncome ? 'payment received' : 'payment sent'}`,
        amount: amount.toFixed(2),
        currency,
        direction: isIncome ? 'INCOME' : 'EXPENSE',
        status,
        transactionDate: info.transaction_initiation_date || new Date().toISOString(),
      };
    } catch (error) {
      return null;
    }
  },

  mapCaptureToTransaction(captureResponse, orderId) {
    const capture = captureResponse.purchase_units?.[0]?.payments?.captures?.[0];
    if (!capture) return null;

    return {
      source: 'PAYPAL_CHECKOUT',
      externalId: capture.id,
      merchant: 'PayPal Checkout',
      description: `PayPal payment - Order ${orderId}`,
      amount: capture.amount?.value || '0',
      currency: capture.amount?.currency_code || 'USD',
      direction: 'EXPENSE',
      status: capture.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
      transactionDate: capture.create_time || new Date().toISOString(),
    };
  },
};

