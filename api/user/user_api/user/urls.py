from django.urls import path
from .views import UserViewSet

urlpatterns = [
    path('my-profile', UserViewSet.as_view({'patch': 'get_user_info'})),
    path('my-profile/update', UserViewSet.as_view({ 'patch': 'change_user_info' })),
]