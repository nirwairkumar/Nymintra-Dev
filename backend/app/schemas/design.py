from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime

class ZoneSchema(BaseModel):
    id: str
    label: str
    type: str # text, image
    position: Dict[str, int] # {"x": 350, "y": 120}
    dimensions: Dict[str, int] # {"width": 500, "height": 60}
    style: Dict[str, str | int]
    constraints: Dict[str, Any]
    languages: List[str]

class CardDesignBase(BaseModel):
    name: str
    slug: str
    categories: List[str] # Changed to support multiple categories
    style: Optional[str] = None
    description: Optional[str] = None
    base_price: float
    min_quantity: int = 50 # New field for minimum purchase
    thumbnail_url: HttpUrl
    image_urls: List[HttpUrl] = [] # New field for multi-image gallery
    preview_url: Optional[HttpUrl] = None
    print_url: Optional[HttpUrl] = None
    zones_json: Optional[Dict[str, List[ZoneSchema]]] = None
    supported_langs: List[str] = ["en"]
    orientation: str = "portrait"
    is_active: bool = True
    sort_order: int = 0
    available_stock: int = 1000
    print_price: float = 0.0
    print_price_unit: int = 100
    print_colors: List[str] = []

class CardDesignCreate(CardDesignBase):
    pass

class CardDesignResponse(CardDesignBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PreviewRequest(BaseModel):
    design_id: str
    customizations: Dict[str, str] # e.g., {"event_title": "Rahul Weds Priya", "time": "2:00 PM"}
