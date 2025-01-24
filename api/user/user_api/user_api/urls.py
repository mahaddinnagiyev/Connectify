from django.urls import path, include

urlpatterns = [
    path('auth/', include('custom_auth.urls')),
    path('user/', include('user.urls'))
]
