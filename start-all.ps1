Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  FinSight AI - Starting All Services" -ForegroundColor Green
Write-Host "  Frontend (5173), Backend (5000), AI Microservice (8001)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
node scripts/start-all.mjs
