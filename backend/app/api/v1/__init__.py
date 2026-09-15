from fastapi import APIRouter

from .auth import router as auth_router
from .users import router as users_router
from .buildings import router as buildings_router
from .rooms import router as rooms_router
from .categories import router as categories_router
from .concerns import router as concerns_router
from .notifications import router as notifications_router
from .uploads import router as uploads_router
from .analytics import router as analytics_router
from .reports import router as reports_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(users_router, prefix="/users", tags=["users"])
router.include_router(buildings_router, prefix="/buildings", tags=["buildings"])
router.include_router(rooms_router, prefix="/rooms", tags=["rooms"])
router.include_router(categories_router, prefix="/categories", tags=["categories"])
router.include_router(concerns_router, prefix="/concerns", tags=["concerns"])
router.include_router(notifications_router, prefix="/notifications", tags=["notifications"])
router.include_router(uploads_router, prefix="/uploads", tags=["uploads"])
router.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
router.include_router(reports_router, prefix="/reports", tags=["reports"])
