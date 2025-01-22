from django.urls import path, include
from .views import AuthViewSet

urlpatterns = [
    path('signup', AuthViewSet.as_view({ "post": "signup" })),
    path('signup/confirm', AuthViewSet.as_view({ "post": "confirm" }))
]