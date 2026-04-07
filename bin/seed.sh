#!/usr/bin/env bash
set -e

echo "=========================================="
echo "  Vanted — Seed Services via Admin API"
echo "=========================================="

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set."
  exit 1
fi

BASE_URL="${BASE_URL:-http://localhost:8080}"
ADMIN_USER="${ADMIN_USERNAME:-admin}"
ADMIN_PASS="${ADMIN_PASSWORD:-vanted-admin-2024}"

echo ""
echo "Connecting to: $BASE_URL"
echo ""

echo "[1/3] Logging in as admin..."
TOKEN=$(curl -sf -X POST "$BASE_URL/api/admin/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" \
  | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{console.log(JSON.parse(d).token)})")

if [ -z "$TOKEN" ]; then
  echo "ERROR: Could not obtain admin token. Is the API server running?"
  exit 1
fi

echo "[2/3] Removing existing services..."
EXISTING=$(curl -sf "$BASE_URL/api/services?limit=100" \
  | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{JSON.parse(d).services.forEach(s=>console.log(s.id))})")

for ID in $EXISTING; do
  curl -sf -X DELETE "$BASE_URL/api/services/$ID" \
    -H "x-admin-token: $TOKEN" > /dev/null
done

echo "[3/3] Seeding 7 Vanted services..."

seed_service() {
  curl -sf -X POST "$BASE_URL/api/services" \
    -H "Content-Type: application/json" \
    -H "x-admin-token: $TOKEN" \
    -d "$1" \
    | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const r=JSON.parse(d);console.log('  Created:',r.name,'(id:'+r.id+')')})"
}

seed_service '{"name":"Car","shortDescription":"Professional car driver at your doorstep. Reliable, safe, and on-time service.","description":"Book a professional car driver on demand. Our trained drivers come to your location and drive you safely to your destination. Available 24/7 with just a tap.","price":249,"category":"Driver","deliveryTime":"~15 minutes","imageUrl":null,"featured":true,"rating":4.8,"reviewCount":320,"available":true}'
seed_service '{"name":"Bike","shortDescription":"Fast and affordable bike rider on demand for quick rides and errands.","description":"Get a professional bike rider to your location in minutes. Perfect for quick errands, deliveries, or short-distance commutes at a very affordable price.","price":99,"category":"Driver","deliveryTime":"~10 minutes","imageUrl":null,"featured":false,"rating":4.6,"reviewCount":215,"available":true}'
seed_service '{"name":"Plumber","shortDescription":"Expert plumber for all plumbing repairs, leaks, and installations at home.","description":"Get a certified plumber to fix leaks, repair pipes, unclog drains, and handle all plumbing needs at your home. Fast, reliable, and affordable service.","price":399,"category":"Home Needs","deliveryTime":"~30 minutes","imageUrl":null,"featured":false,"rating":4.7,"reviewCount":182,"available":true}'
seed_service '{"name":"Chef","shortDescription":"Professional chef for home cooking, events, and special occasions.","description":"Book a professional chef for your home. Our experienced chefs will prepare delicious meals for your family, guests, or special occasions. Various cuisines available.","price":699,"category":"Home Needs","deliveryTime":"~45 minutes","imageUrl":null,"featured":true,"rating":4.9,"reviewCount":98,"available":true}'
seed_service '{"name":"Technician","shortDescription":"Certified technician for repair of home appliances and electronics.","description":"Book a certified technician to repair your home appliances, electronics, and devices. TVs, washing machines, AC units, refrigerators, and more — all covered.","price":499,"category":"Home Needs","deliveryTime":"~35 minutes","imageUrl":null,"featured":false,"rating":4.5,"reviewCount":153,"available":true}'
seed_service '{"name":"Electrician","shortDescription":"Licensed electrician for wiring, repairs, and electrical installations.","description":"Get a licensed electrician at your home for wiring, switch and socket repairs, fan and light installation, electrical safety inspection, and more.","price":349,"category":"Home Needs","deliveryTime":"~30 minutes","imageUrl":null,"featured":false,"rating":4.6,"reviewCount":204,"available":true}'
seed_service '{"name":"Packers & Movers","shortDescription":"Professional packing and moving service for home and office relocation.","description":"Hassle-free home and office relocation with our professional packers and movers team. We handle packing, loading, transportation, and unloading with care.","price":1499,"category":"Courier","deliveryTime":"~60 minutes","imageUrl":null,"featured":true,"rating":4.7,"reviewCount":76,"available":true}'

echo ""
echo "=========================================="
echo "  Seed complete! 7 services created."
echo "=========================================="
