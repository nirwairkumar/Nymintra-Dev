from pydantic import BaseModel
from typing import Optional

class PaymentCreateReq(BaseModel):
    amount_in_rupees: float
    order_id: str

class PaymentVerifyReq(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    internal_order_id: str
