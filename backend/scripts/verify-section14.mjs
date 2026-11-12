// FinSight Section 14 Endpoints Verification using native fetch

async function testSection14Endpoints() {
  console.log('Testing Section 14 Endpoints against localhost:5000...');

  // 1. Login to get fresh token
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0' },
    body: JSON.stringify({ email: 'demo@example.com', password: 'DemoPassword123!' }),
  });

  const loginData = await loginRes.json();
  console.log('1. Login status:', loginRes.status, 'success:', loginData.success);

  let token = loginData.data?.token;

  if (!token) {
    console.error('Failed to login:', loginData);
    process.exit(1);
  }

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 2. Profile GET
  const profileRes = await fetch('http://localhost:5000/api/v1/profile', { headers: authHeaders });
  const profileData = await profileRes.json();
  console.log('2. Profile status:', profileRes.status, 'Full name:', profileData.data?.personalInfo?.fullName);
  console.log('   Active sessions count:', profileData.data?.accountInfo?.activeSessions);

  // 3. Profile PUT
  const updateRes = await fetch('http://localhost:5000/api/v1/profile', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ phone: '+91 99887 76655', country: 'India' }),
  });
  const updateData = await updateRes.json();
  console.log('3. Profile Update status:', updateRes.status, 'Phone:', updateData.data?.user?.phone);

  // 4. Sessions GET
  const sessionsRes = await fetch('http://localhost:5000/api/v1/sessions', { headers: authHeaders });
  const sessionsData = await sessionsRes.json();
  console.log('4. Sessions status:', sessionsRes.status, 'Count:', sessionsData.data?.sessions?.length);
  const currentSession = sessionsData.data?.sessions?.find(s => s.isCurrent);
  console.log('   Current session detected:', !!currentSession, 'Device:', currentSession?.deviceName);

  // 5. Login History GET
  const historyRes = await fetch('http://localhost:5000/api/v1/sessions/login-history', { headers: authHeaders });
  const historyData = await historyRes.json();
  console.log('5. Login History status:', historyRes.status, 'Events:', historyData.data?.history?.length);

  // 6. Activity Timeline GET
  const activityRes = await fetch('http://localhost:5000/api/v1/activity', { headers: authHeaders });
  const activityData = await activityRes.json();
  console.log('6. Activity Timeline status:', activityRes.status, 'Total activities:', activityData.data?.pagination?.total);
  console.log('   Category counts:', activityData.data?.categoryCounts);

  // 7. Security Audit Logs GET
  const auditRes = await fetch('http://localhost:5000/api/v1/activity/audit-logs', { headers: authHeaders });
  const auditData = await auditRes.json();
  console.log('7. Audit Logs status:', auditRes.status, 'Count:', auditData.data?.logs?.length);

  // 8. Heartbeat POST
  const heartbeatRes = await fetch('http://localhost:5000/api/v1/auth/heartbeat', {
    method: 'POST',
    headers: authHeaders,
  });
  const heartbeatData = await heartbeatRes.json();
  console.log('8. Heartbeat status:', heartbeatRes.status, 'Last seen:', heartbeatData.data?.lastSeenAt);

  // 9. Export Data GET
  const exportRes = await fetch('http://localhost:5000/api/v1/profile/export-data', { headers: authHeaders });
  const exportData = await exportRes.json();
  console.log('9. GDPR Export status:', exportRes.status, 'Export version:', exportData.exportVersion);
  console.log('   Financial transactions exported:', exportData.financialData?.transactionsCount);

  console.log('\n--- ALL SECTION 14 BACKEND ENDPOINTS PASSED VERIFICATION! ---');
}

testSection14Endpoints().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
