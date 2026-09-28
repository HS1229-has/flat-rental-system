$JAVA_BIN = "C:\Users\hyyt0\.jdks\openjdk-26.0.2.1\bin\java.exe"
if (-not (Test-Path $JAVA_BIN)) {
    $JAVA_BIN = "C:\Users\hyyt0\.jdks\openjdk-26.0.2\bin\java.exe"
}
$WDIR = "c:\Users\hyyt0\Downloads\flat-rental-system-day1\flat-rental-system"
$LOGDIR = "$WDIR\logs"

if (-not (Test-Path $LOGDIR)) { New-Item -ItemType Directory -Path $LOGDIR -Force | Out-Null }

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Launching LuxeFlats on Localhost...     " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Stop any old instances
Write-Host "[1/7] Stopping any existing instances..." -ForegroundColor Yellow
Get-Process -Name "java", "node" -ErrorAction SilentlyContinue | ForEach-Object {
    $cmd = (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)" -ErrorAction SilentlyContinue).CommandLine
    if ($cmd -and ($cmd -match "auth-service|property-service|booking-service|payment-service|api-gateway|vite")) {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Seconds 2

# 2. Define Microservices
$services = @(
    @{name="auth-service"; port=8081; args=@("-jar", "auth-service/target/auth-service.jar")},
    @{name="property-service"; port=8082; args=@("-jar", "property-service/target/property-service.jar")},
    @{name="booking-service"; port=8083; args=@("-jar", "booking-service/target/booking-service.jar")},
    @{name="payment-service"; port=8084; args=@("-jar", "payment-service/target/payment-service.jar")},
    @{name="api-gateway"; port=8080; args=@(
        "-Dio.netty.tryReflectionSetAccessible=true",
        "--add-opens=java.base/java.nio=ALL-UNNAMED",
        "--add-opens=java.base/sun.nio.ch=ALL-UNNAMED",
        "--add-opens=java.base/java.lang=ALL-UNNAMED",
        "--add-opens=java.base/java.lang.reflect=ALL-UNNAMED",
        "-jar", "api-gateway/target/api-gateway.jar"
    )}
)

foreach ($svc in $services) {
    Write-Host "Starting $($svc.name) on port $($svc.port)..." -ForegroundColor Green
    Start-Process -FilePath $JAVA_BIN `
        -ArgumentList $svc.args `
        -WorkingDirectory $WDIR `
        -WindowStyle Hidden `
        -RedirectStandardOutput "$LOGDIR\$($svc.name).log" `
        -RedirectStandardError "$LOGDIR\$($svc.name)-err.log"
    Start-Sleep -Seconds 3
}

# 3. Start Frontend (Vite)
Write-Host "Starting Frontend (Vite) on http://localhost:5173..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c npm run dev" `
    -WorkingDirectory "$WDIR\frontend" `
    -WindowStyle Hidden `
    -RedirectStandardOutput "$LOGDIR\frontend.log" `
    -RedirectStandardError "$LOGDIR\frontend-err.log"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " All Services Started Successfully!" -ForegroundColor Cyan
Write-Host " Frontend:    http://localhost:5173" -ForegroundColor White
Write-Host " API Gateway: http://localhost:8080" -ForegroundColor White
Write-Host " Logs folder: $LOGDIR" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan

# Keep process alive
while ($true) {
    Start-Sleep -Seconds 30
}
