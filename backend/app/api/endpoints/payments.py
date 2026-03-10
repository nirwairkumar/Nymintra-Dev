from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from app.db.database import get_supabase
from app.api.endpoints.users import get_current_user
from app.services.payment import create_order, verify_payment_signature
from app.schemas.payment import PaymentCreateReq, PaymentVerifyReq
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/create-order")
def create_payment_order(req: PaymentCreateReq, current_user: dict = Depends(get_current_user)):
    try:
        # Amount in Paisa
        amount_paisa = int(req.amount_in_rupees * 100)
        
        # In a real scenario, you'd fetch the actual order from DB
        # and ensure it belongs to `current_user`
        
        rp_order = create_order(amount=amount_paisa, receipt=f"receipt_{req.order_id}")
        
        return {
            "id": rp_order["id"],
            "amount": rp_order["amount"],
            "currency": rp_order["currency"]
        }
    except Exception as e:
        logger.error(f"Error creating Razorpay order: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to initiate payment gateway"
        )

@router.post("/verify")
def verify_payment(req: PaymentVerifyReq, current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    is_valid = verify_payment_signature(
        req.razorpay_order_id,
        req.razorpay_payment_id,
        req.razorpay_signature
    )
    
    if not is_valid:
         raise HTTPException(
             status_code=400, detail="Payment signature verification failed"
         )
         
    # At this point, update the Database `Payment` table and Update `Order` status to CONFIRMED
    # db_order = db.query(Order).filter(...).first()
    # db_order.status = 'CONFIRMED'
    # db.commit()
    
    return {"status": "success", "message": "Payment verified successfully"}
