$token = "nfp_tkoQE3R5jF7FuwyyRCBDQuuF1vAQRj8Y64d0"
$body = @{name='personalized-travel-itinerary-planner'} | ConvertTo-Json
$response = Invoke-RestMethod -Method Post -Uri 'https://api.netlify.com/api/v1/sites' -Headers @{Authorization = "Bearer $token"} -ContentType 'application/json' -Body $body
$response | ConvertTo-Json -Depth 5
