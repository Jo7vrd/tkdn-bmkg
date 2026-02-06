#!/bin/bash

# TKDN Evaluator API Testing Script
# Usage: bash test-api.sh

API_URL="http://localhost:8000/api"
TOKEN=""

echo "======================================"
echo "  TKDN Evaluator API Testing"
echo "======================================"
echo ""

# 1. Health Check
echo "1️⃣  Testing Health Check..."
curl -s $API_URL/health | jq .
echo -e "\n"

# 2. Register (skip if user exists)
echo "2️⃣  Testing Register..."
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "testuser2@bmkg.go.id",
    "password": "password123",
    "full_name": "Test User 2 BMKG",
    "nip": "199001012020121002",
    "phone": "08123456789",
    "unit_kerja": "Stasiun Meteorologi Surabaya",
    "jabatan": "Staf",
    "ppk_name": "PPK Test 2"
  }')
echo $REGISTER_RESPONSE | jq .
echo -e "\n"

# 3. Login
echo "3️⃣  Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@bmkg.go.id",
    "password": "password123"
  }')
echo $LOGIN_RESPONSE | jq .

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "✅ Token: ${TOKEN:0:50}..."
echo -e "\n"

# 4. Get Profile
echo "4️⃣  Testing Get Profile (Protected)..."
curl -s -X GET $API_URL/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

# 5. Create Evaluation
echo "5️⃣  Testing Create Evaluation..."
CREATE_EVAL=$(curl -s -X POST $API_URL/evaluations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "ppkData": {
      "nama_ppk": "Budi Santoso",
      "nip": "199001012020121003",
      "no_hp": "081234567890",
      "email": "budi@bmkg.go.id",
      "unit_kerja": "Stasiun Meteorologi Jakarta",
      "jabatan": "Kepala Stasiun"
    },
    "documents": [],
    "items": [
      {
        "itemName": "Laptop Dell Latitude",
        "quantity": 5,
        "unit": "Unit",
        "brand": "Dell",
        "model": "Latitude 5420",
        "specifications": "Intel Core i5, 8GB RAM, 256GB SSD",
        "category": "Elektronik",
        "finalPrice": 10000000,
        "foreignPrice": 8000000,
        "bmp": 20,
        "tkdn": 25.5,
        "status": "Lulus",
        "regulation": "Permen BUMN No. 15/2012"
      },
      {
        "itemName": "Monitor LG 24 inch",
        "quantity": 10,
        "unit": "Unit",
        "brand": "LG",
        "model": "24MK430H",
        "specifications": "LED IPS 24 inch Full HD",
        "category": "Elektronik",
        "finalPrice": 2000000,
        "foreignPrice": 1500000,
        "bmp": 25,
        "tkdn": 30.5,
        "status": "Lulus",
        "regulation": "Permen BUMN No. 15/2012"
      }
    ]
  }')
echo $CREATE_EVAL | jq .
EVAL_ID=$(echo $CREATE_EVAL | jq -r '.data.id')
echo "✅ Evaluation ID: $EVAL_ID"
echo -e "\n"

# 6. Get All Evaluations
echo "6️⃣  Testing Get All Evaluations..."
curl -s -X GET $API_URL/evaluations \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

# 7. Get Evaluation by ID
if [ ! -z "$EVAL_ID" ] && [ "$EVAL_ID" != "null" ]; then
  echo "7️⃣  Testing Get Evaluation by ID: $EVAL_ID..."
  curl -s -X GET $API_URL/evaluations/$EVAL_ID \
    -H "Authorization: Bearer $TOKEN" | jq .
  echo -e "\n"
fi

echo "======================================"
echo "  ✅ All Tests Completed!"
echo "======================================"
