from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.encoders import jsonable_encoder
from typing import List
from supabase import Client
from app.db.database import get_supabase
from app.schemas.design import CardDesignResponse, CardDesignCreate
from app.api.endpoints.users import get_current_user
from uuid import uuid4
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/upload-image")
async def upload_card_image(file: UploadFile = File(...), current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    """
    Upload a card image to Supabase Storage bucket 'card-images'.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can upload images")
        
    try:
        file_content = await file.read()
        file_ext = file.filename.split(".")[-1]
        file_name = f"{uuid4()}.{file_ext}"
        
        # Upload to supabase storage
        # Note: Ensure bucket 'card-images' exists. We attempt to auto-create if missing.
        try:
            supabase.storage.from_("card-images").upload(
                path=file_name,
                file=file_content,
                file_options={"content-type": file.content_type}
            )
        except Exception as storage_err:
            # If bucket not found, try to create it automatically
            err_msg = str(storage_err).lower()
            if "bucket_not_found" in err_msg or "not found" in err_msg:
                try:
                    logger.info("Bucket 'card-images' missing. Attempting auto-creation...")
                    supabase.storage.create_bucket("card-images", options={"public": True})
                    # Retry upload
                    supabase.storage.from_("card-images").upload(
                        path=file_name,
                        file=file_content,
                        file_options={"content-type": file.content_type}
                    )
                except Exception as create_err:
                    logger.error(f"Failed to auto-create bucket: {str(create_err)}")
                    raise HTTPException(status_code=404, detail="Storage bucket 'card-images' not found. Please create it manually in Supabase dashboard.")
            else:
                logger.error(f"Supabase Storage Error: {str(storage_err)}")
                raise storage_err
        
        # Get public URL
        public_url = supabase.storage.from_("card-images").get_public_url(file_name)
        return {"url": public_url}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/", response_model=CardDesignResponse)
def create_design(design_in: CardDesignCreate, current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    """
    Create a new card design. Restricted to Admins.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can upload cards")
    
    # Generate slug if not provided or ensure it's unique
    # For now, we assume frontend sends a valid slug or we could generate one
    design_data = jsonable_encoder(design_in)
    
    # Provide a value for the legacy 'category' column (which is likely set to NOT NULL)
    # to avoid constraint violations, picking the first item or a default string.
    if "categories" in design_data and isinstance(design_data["categories"], list) and len(design_data["categories"]) > 0:
        design_data["category"] = design_data["categories"][0]
    else:
        design_data["category"] = "uncategorized"
        
    # Provide fallbacks for legacy URL columns that might be NOT NULL
    if not design_data.get("preview_url"):
        design_data["preview_url"] = design_data.get("thumbnail_url", "")
    if not design_data.get("print_url"):
        design_data["print_url"] = design_data.get("thumbnail_url", "")
        
    # Provide fallback for legacy zones_json column if it's NOT NULL
    if "zones_json" not in design_data:
        design_data["zones_json"] = {}
    
    try:
        response = supabase.table("card_designs").insert(design_data).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create card")
        return response.data[0]
    except Exception as e:
        error_msg = str(e)
        if hasattr(e, 'response') and e.response is not None:
             error_msg = e.response.json()
        raise HTTPException(status_code=400, detail=f"Database error: {error_msg}")

@router.get("/", response_model=List[CardDesignResponse])
def get_designs(skip: int = 0, limit: int = 20, category: str = None, supabase: Client = Depends(get_supabase)):
    """
    Retrieve active card designs, optionally filtered by categories.
    """
    query = supabase.table("card_designs").select("*").eq("is_active", True)
    if category:
        # Check if the category exists in the categories JSONB array
        # Supabase Python client uses filter() with contain-subset if needed, 
        # but filter for JSONB contains is .cs()
        query = query.filter("categories", "cs", f'["{category}"]')
    
    # Supabase range is inclusive
    response = query.order("sort_order", desc=True).range(skip, skip + limit - 1).execute()
    return response.data

@router.get("/{slug}", response_model=CardDesignResponse)
def get_design_by_slug(slug: str, supabase: Client = Depends(get_supabase)):
    """
    Get a specific design by slug for the customization page.
    """
    response = supabase.table("card_designs").select("*").eq("slug", slug).eq("is_active", True).execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Design not found")
    return response.data[0]
