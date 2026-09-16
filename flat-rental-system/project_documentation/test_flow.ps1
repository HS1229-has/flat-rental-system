$ErrorActionPreference = 'Stop'

function Request ($method, $url, $body, $token, $userId) {
    $headers = @{
        "Content-Type" = "application/json"
    }
    if ($token) { $headers.Add("Authorization", "Bearer $token") }
    if ($userId) { $headers.Add("X-User-Id", $userId) }
    
    $jsonBody = $body | ConvertTo-Json
    return Invoke-RestMethod -Uri $url -Method $method -Headers $headers -Body $jsonBody
}

function RequestGet ($url, $token, $userId) {
    $headers = @{}
    if ($token) { $headers.Add("Authorization", "Bearer $token") }
    if ($userId) { $headers.Add("X-User-Id", $userId) }
    return Invoke-RestMethod -Uri $url -Method Get -Headers $headers
}

try {
    $rand = Get-Random -Minimum 1000 -Maximum 9999
    # 1. Register/Login Owner
    Write-Output "--- Registering Owner ---"
    $ownerReg = @{ username = "testowner$rand"; email = "owner$rand@test.com"; password = "password123"; fullName = "Test Owner"; phoneNumber = "111"; role = "OWNER" }
    Request "POST" "http://localhost:8080/api/auth/register" $ownerReg $null $null | Out-Null
    
    $ownerLog = @{ username = "testowner$rand"; password = "password123" }
    $ownerAuth = Request "POST" "http://localhost:8080/api/auth/login" $ownerLog $null $null
    $ownerToken = $ownerAuth.token
    $ownerId = $ownerAuth.userId
    Write-Output "Owner Logged In! ID: $ownerId"
    
    # 2. Add Property
    Write-Output "--- Adding Property ---"
    $prop = @{ title = "Beautiful Villa"; description = "Great place"; address = "123 Main St"; city = "Goa"; rentAmount = 50000; propertyType = "VILLA"; bedrooms = 3; bathrooms = 2 }
    $propRes = Request "POST" "http://localhost:8080/api/properties" $prop $ownerToken $ownerId
    $propId = $propRes.id
    Write-Output "Property Created! ID: $propId"

    # 3. Register/Login Tenant
    Write-Output "--- Registering Tenant ---"
    $tenantReg = @{ username = "testtenant$rand"; email = "tenant$rand@test.com"; password = "password123"; fullName = "Test Tenant"; phoneNumber = "222"; role = "TENANT" }
    Request "POST" "http://localhost:8080/api/auth/register" $tenantReg $null $null | Out-Null
    
    $tenantLog = @{ username = "testtenant$rand"; password = "password123" }
    $tenantAuth = Request "POST" "http://localhost:8080/api/auth/login" $tenantLog $null $null
    $tenantToken = $tenantAuth.token
    $tenantId = $tenantAuth.userId
    Write-Output "Tenant Logged In! ID: $tenantId"

    # 4. Book Property
    Write-Output "--- Booking Property ---"
    $book = @{ propertyId = $propId; startDate = "2026-09-01"; endDate = "2026-09-10"; tokenPaymentReference = "MOCK-TXN-REF-12345" }
    $bookRes = Request "POST" "http://localhost:8080/api/bookings" $book $tenantToken $tenantId
    $bookId = $bookRes.id
    Write-Output "Booking Created! ID: $bookId"

    # 5. Make Token Payment
    Write-Output "--- Making Token Payment ---"
    $pay = @{ bookingId = $bookId; amount = 50000; paymentMethod = "CARD"; paymentType = "TOKEN" }
    $payRes = Request "POST" "http://localhost:8080/api/payments" $pay $tenantToken $tenantId
    $payId = $payRes.id
    Write-Output "Token Payment Success! ID: $payId, Status: $($payRes.status)"

    # 5.1 Owner Approves Booking & Shares Contact
    Write-Output "--- Owner Approving Booking ---"
    $contact = @{ fullName = "Test Owner"; phone = "111"; email = "owner@test.com"; preferredContactMethod = "EMAIL"; message = "Welcome to your new home!" }
    $approveRes = Request "POST" "http://localhost:8080/api/bookings/$bookId/approve-with-contact" $contact $ownerToken $ownerId
    Write-Output "Booking Approved! Status: $($approveRes.status)"

    # 5.2 Tenant Makes Rent Payment
    Write-Output "--- Making Rent Payment ---"
    $payRent = @{ bookingId = $bookId; amount = 50000; paymentMethod = "CARD"; paymentType = "RENT" }
    $payRentRes = Request "POST" "http://localhost:8080/api/payments" $payRent $tenantToken $tenantId
    $payRentId = $payRentRes.id
    Write-Output "Rent Payment Success! ID: $payRentId, Status: $($payRentRes.status)"

    # 5.3 Complete Booking Status (matches frontend behavior in Payment.jsx)
    Write-Output "--- Completing Booking ---"
    $completeBookingRes = Request "PATCH" "http://localhost:8080/api/bookings/$bookId/status?status=COMPLETED" $null $tenantToken $tenantId
    Write-Output "Booking Completed! Status: $($completeBookingRes.status)"

    # 6. Check Tenant Dashboard
    Write-Output "--- Fetching Tenant Dashboard Bookings ---"
    $tenantBookings = RequestGet "http://localhost:8080/api/bookings/tenant/$tenantId" $tenantToken $tenantId
    Write-Output "Tenant Bookings count: $($tenantBookings.Count). First booking status: $($tenantBookings[0].status)"

    # 7. Check Owner Dashboard
    Write-Output "--- Fetching Owner Dashboard Properties ---"
    $ownerProps = RequestGet "http://localhost:8080/api/properties/owner/$ownerId" $ownerToken $ownerId
    Write-Output "Owner Properties count: $($ownerProps.Count)"

    Write-Output "ALL TESTS PASSED SUCCESSFULLY!"
} catch {
    Write-Output "TEST FAILED:"
    Write-Output $_.Exception.Message
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $body = $reader.ReadToEnd()
            Write-Output "Response body: $body"
        } catch {}
    }
}
