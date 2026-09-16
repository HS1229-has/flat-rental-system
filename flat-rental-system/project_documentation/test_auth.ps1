$ErrorActionPreference = 'Stop'
$registerBody = @{
    username = "testtenant"
    email = "tenant@test.com"
    password = "password123"
    fullName = "Test Tenant"
    phoneNumber = "9876543210"
    role = "TENANT"
} | ConvertTo-Json

Write-Output "--- Registering ---"
try {
    $regResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Output ($regResponse | ConvertTo-Json)
} catch {
    Write-Output $_.Exception.Message
}

$loginBody = @{
    username = "testtenant"
    password = "password123"
} | ConvertTo-Json

Write-Output "--- Logging In ---"
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Output ($loginResponse | ConvertTo-Json)
} catch {
    Write-Output $_.Exception.Message
}
