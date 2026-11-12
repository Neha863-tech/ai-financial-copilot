import { FinancialAgentEngine } from '../../frontend/src/services/financialAgentEngine.ts';

async function testAI() {
  console.log('=====================================================');
  console.log('       FINSIGHT AI - CHATGPT ENGINE LIVE TESTS        ');
  console.log('=====================================================\n');

  const questions = [
    {
      title: 'TEST 1: CREDIT SCORE & CIBIL REPAIR',
      query: 'How do I improve my CIBIL credit score above 750?'
    },
    {
      title: 'TEST 2: DEBT ELIMINATION STRATEGY',
      query: 'Should I use debt snowball or avalanche to clear my credit cards?'
    },
    {
      title: 'TEST 3: WEALTH & SIP INVESTING',
      query: 'How much should I invest in Nifty 50 index mutual fund SIP every month?'
    },
    {
      title: 'TEST 4: LARGE PURCHASE AFFORDABILITY (CAR / VEHICLE)',
      query: 'Can I afford to buy a car worth 12 lakhs right now?'
    },
    {
      title: 'TEST 5: HOUSING BUY VS RENT SIMULATION',
      query: 'Should I buy a flat or rent in Bangalore?'
    }
  ];

  for (const q of questions) {
    console.log(`\n-----------------------------------------------------`);
    console.log(`>>> ${q.title}`);
    console.log(`User Question: "${q.query}"`);
    console.log(`-----------------------------------------------------`);

    const res = await FinancialAgentEngine.processQuery(q.query);
    console.log(`Speaking Agent: ${res.agentName} (${res.agentRole || 'Advisor'})`);
    console.log(`\nAI Response Output:\n`);
    console.log(res.text);

    if (res.recommendations && res.recommendations.length > 0) {
      console.log(`\nActionable Recommendations:`);
      res.recommendations.forEach((r, idx) => console.log(` [${idx + 1}] ${r}`));
    }

    if (res.suggestedFollowUps && res.suggestedFollowUps.length > 0) {
      console.log(`\nSuggested Follow-Up Prompts:`);
      res.suggestedFollowUps.forEach((f) => console.log(` • "${f}"`));
    }
  }

  console.log('\n=====================================================');
  console.log('      ALL CHATGPT CONVERSATIONAL TESTS COMPLETED      ');
  console.log('=====================================================');
}

testAI().catch(console.error);
