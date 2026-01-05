# Payment System Test Guide

## Quick Test Steps

### 1. Add Your Stripe Keys
**Backend (.env):**
```env
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_CURRENCY=lkr
```

**Frontend (.env):**
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 2. Start the Servers
```bash
# Backend (Terminal 1)
cd boat-service-management-TestVihanga/backend
npm run dev

# Frontend (Terminal 2)  
cd boat-service-management-TestVihanga/frontend
npm start
```

### 3. Test Payment
1. Go to any service page (boat rides, spare parts, etc.)
2. Click "Pay Now" button
3. Use test card: `4242 4242 4242 4242`
4. Expiry: `12/25`, CVC: `123`
5. Click "Pay"

### 4. Expected Result
- Payment modal opens
- Card form appears
- Payment processes successfully
- Success message shows

## Test Cards
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`

## Troubleshooting
- **"Invalid API Key"**: Check your Stripe keys in .env files
- **"Network Error"**: Make sure backend is running on port 5001
- **"CORS Error"**: Check frontend is on port 3002

## Next Steps
- Test with different service types
- Test payment failures
- Add payment buttons to existing pages
