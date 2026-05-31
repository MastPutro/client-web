#!/bin/bash

# Test API Register User Endpoint
# Usage: bash test-api-register.sh

API_KEY="test-api-key-12345"
API_URL="http://localhost:8000/api/register-user"
TIMESTAMP=$(date +%s%N | cut -b1-13)
EMAIL="testuser${TIMESTAMP}@example.com"

echo "========================================"
echo "Testing API Register User Endpoint"
echo "========================================"
echo "URL: $API_URL"
echo "API Key: $API_KEY"
echo "Email: $EMAIL"
echo ""

# Make request
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"$EMAIL\",
    \"password\": \"TestPassword123!\",
    \"password_confirmation\": \"TestPassword123!\"
  }")

# Extract HTTP status code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
# Extract response body (all except last line)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status Code: $HTTP_CODE"
echo ""
echo "Response:"
echo "$BODY" | json_pp 2>/dev/null || echo "$BODY"
echo ""

# Check if successful
if [ "$HTTP_CODE" == "201" ]; then
  echo "✓ Registration successful!"
  
  # Verify user in database
  echo ""
  echo "Verifying user in database..."
  php artisan tinker <<EOF
\$user = App\Models\User::where('email', '$EMAIL')->first();
if (\$user) {
    echo "✓ User found in database!\n";
    echo "  ID: " . \$user->id . "\n";
    echo "  Name: " . \$user->name . "\n";
    echo "  Email: " . \$user->email . "\n";
} else {
    echo "✗ User NOT found in database!\n";
}
exit;
EOF
else
  echo "✗ Registration failed!"
  echo ""
  echo "Possible issues:"
  echo "1. API Key is invalid or missing"
  echo "2. Database connection issue"
  echo "3. Validation error - check password requirements"
  echo ""
  echo "Check logs at: storage/logs/laravel.log"
fi
