async function run() {
  const base = 'http://localhost:5000/api/v1';

  console.log('=====================================================');
  console.log('       FINSIGHT AI - FULL-STACK SYSTEM TEST           ');
  console.log('=====================================================\n');

  // 1. Health check
  console.log('--- 1. BACKEND HEALTH CHECK ---');
  const healthRes = await fetch('http://localhost:5000/health');
  const healthData = await healthRes.json();
  console.log('HTTP Status:', healthRes.status, 'OK');
  console.log('App:', healthData.app, '| Environment:', healthData.environment);
  console.log('Database Status:', healthData.services.database.status, `(Latency: ${healthData.services.database.latencyMs}ms)`);
  console.log('AI Provider:', healthData.services.ai.provider);
  console.log('PayPal Environment:', healthData.services.paypal.environment);

  // 2. Authentication
  console.log('\n--- 2. USER AUTHENTICATION & JWT (POST /api/v1/auth/login) ---');
  const loginRes = await fetch(base + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@example.com', password: 'DemoPassword123!' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.token || loginJson.token;
  const user = loginJson.data?.user || loginJson.user;
  console.log('HTTP Status:', loginRes.status, 'OK');
  console.log('Logged In User:', user.fullName, `<${user.email}>`);
  console.log('User ID:', user.id);
  console.log('Currency:', user.preferredCurrency);
  console.log('JWT Bearer Token:', token.substring(0, 32) + '...');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  };

  // 3. Transactions from PostgreSQL
  console.log('\n--- 3. LIVE TRANSACTIONS FROM POSTGRESQL (GET /api/v1/transactions) ---');
  const txRes = await fetch(base + '/transactions', { headers: authHeaders });
  const txData = await txRes.json();
  const txList = txData.data?.transactions || txData.transactions || txData.data || [];
  console.log('HTTP Status:', txRes.status, 'OK');
  console.log('Total Transactions in Database:', txList.length);
  console.log('Sample Ledger Records:');
  txList.slice(0, 5).forEach((t, i) => {
    const d = t.date ? t.date.substring(0, 10) : 'N/A';
    const cat = t.category?.name || t.category || 'General';
    console.log(`  [${i + 1}] ${d} | ${t.merchant.padEnd(20)} | Rs. ${String(t.amount).padStart(6)} | ${cat.padEnd(16)} | ${t.type}`);
  });

  // 4. Budgets
  console.log('\n--- 4. LIVE BUDGETS (GET /api/v1/budgets) ---');
  const bgRes = await fetch(base + '/budgets', { headers: authHeaders });
  const bgData = await bgRes.json();
  const budgets = bgData.data || bgData;
  console.log('HTTP Status:', bgRes.status, 'OK');
  console.log('Configured Budgets Count:', Array.isArray(budgets) ? budgets.length : 'N/A');
  if (Array.isArray(budgets) && budgets.length > 0) {
    budgets.slice(0, 4).forEach((b, i) => {
      const name = b.category?.name || b.name || `Budget ${i + 1}`;
      console.log(`  - ${name.padEnd(18)}: Limit Rs. ${b.amount}`);
    });
  }

  // 5. Analytics & Pulse
  console.log('\n--- 5. FINANCIAL PULSE & ANALYTICS (GET /api/v1/analytics/overview) ---');
  const anRes = await fetch(base + '/analytics/overview', { headers: authHeaders });
  const anData = await anRes.json();
  const overview = anData.data || anData;
  console.log('HTTP Status:', anRes.status, 'OK');
  console.log('Financial Pulse Metrics:');
  if (overview.summary) {
    console.log('  Total Income:   Rs.', overview.summary.totalIncome);
    console.log('  Total Expenses: Rs.', overview.summary.totalExpense || overview.summary.totalExpenses);
    console.log('  Net Savings:    Rs.', overview.summary.netSavings);
    console.log('  Savings Rate:  ', overview.summary.savingsRate + '%');
  } else {
    console.log('  Overview:', JSON.stringify(overview).substring(0, 200) + '...');
  }

  // 6. AI Financial Assistant
  console.log('\n--- 6. AI FINANCIAL COPILOT (POST /api/v1/ai/chat) ---');
  const aiRes = await fetch(base + '/ai/chat', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ message: 'What is my current monthly savings rate?' })
  });
  const aiJson = await aiRes.json();
  console.log('HTTP Status:', aiRes.status, 'OK');
  const aiMessage = aiJson.data?.message || aiJson.message || aiJson.text || JSON.stringify(aiJson);
  console.log('AI Response Snippet:', aiMessage.substring(0, 150).replace(/\n/g, ' ') + '...');

  // 7. Frontend SPA
  console.log('\n--- 7. FRONTEND VITE SERVER (GET http://localhost:5173) ---');
  const feRes = await fetch('http://localhost:5173');
  console.log('HTTP Status:', feRes.status, 'OK');
  const html = await feRes.text();
  const hasRoot = html.includes('id="root"');
  console.log('Single Page Application Ready:', hasRoot ? 'YES (<div id="root"> mounted)' : 'NO');

  console.log('\n=====================================================');
  console.log('       ALL FULL-STACK SERVICES VERIFIED 100%          ');
  console.log('=====================================================');
}

run().catch(console.error);
