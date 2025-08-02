from typing import Dict, Any, List, TypeVar, Generic
from motor.motor_asyncio import AsyncIOMotorCollection
from schemas.base import PaginationParams, PaginatedResponse

T = TypeVar('T')


async def paginate_collection(
    collection: AsyncIOMotorCollection,
    filters: Dict[str, Any],
    pagination: PaginationParams,
    sort_field: str = "created_at",
    sort_direction: int = -1
) -> Dict[str, Any]:
    """
    Paginate MongoDB collection with filters
    
    Args:
        collection: MongoDB collection
        filters: Query filters
        pagination: Pagination parameters
        sort_field: Field to sort by
        sort_direction: 1 for ascending, -1 for descending
    
    Returns:
        Dictionary with items and pagination info
    """
    # Count total documents
    total = await collection.count_documents(filters)
    
    # Get paginated items
    cursor = collection.find(filters)
    cursor = cursor.sort(sort_field, sort_direction)
    cursor = cursor.skip(pagination.skip).limit(pagination.size)
    
    items = await cursor.to_list(length=pagination.size)
    
    return {
        "items": items,
        "total": total,
        "page": pagination.page,
        "size": pagination.size,
        "pages": (total + pagination.size - 1) // pagination.size
    }


def create_paginated_response(
    items: List[T],
    total: int,
    pagination: PaginationParams
) -> PaginatedResponse[T]:
    """Create paginated response object"""
    return PaginatedResponse.create(items, total, pagination)


def build_sort_criteria(
    sort_by: str = "created_at",
    sort_order: str = "desc"
) -> List[tuple]:
    """Build MongoDB sort criteria"""
    direction = -1 if sort_order.lower() == "desc" else 1
    return [(sort_by, direction)]