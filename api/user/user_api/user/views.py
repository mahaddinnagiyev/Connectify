from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

# Rate Limiter
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator

# Models
from .models import User

# Serializers
from .serializers import ChangeUserInfoSerializer

"""
    **********************************************************************
    User Information Views
    /user/my-profile --> To get user information --> GET
    /user/my-profile/update --> To update user information --> PATCH 
    **********************************************************************
"""

# User View Set
class UserViewSet(ViewSet):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    # Get User Personal Information
    @method_decorator(ratelimit(key='ip', rate='100/m', block=False))
    def get_user_info(self, request):

        # If rate-limited
        if getattr(request, 'limited', False):
            return Response({ "error": "Too many request. Please try again later" }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        try:

            user = User.objects.filter(id=request.user.id).first()

            if user is None:
                return Response({"error": "User not found"}, status=status.HTTP_400_BAD_REQUEST)

            return Response(
                {
                    "success": True,
                    "user": {
                        "id": user.id,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "username": user.username,
                        "email": user.email,
                        "gender": user.gender,
                        "friend_list": list(user.friend_list),
                        "role": user.is_admin
                    }
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            print(e)
            return Response({ "error": "Internal Server Error" }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    # Change User Information
    @method_decorator(ratelimit(key='ip', rate='20/m', block=False))
    def change_user_info(self, request):

        # If rate-limited
        if getattr(request, 'limited', False):
            return Response({ "error": "Too many request. Please try again later" }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        try:
            req_user = request.user

            user = User.objects.filter(id=req_user.id)

            if not user.exists():
                return Response({ "error": "User not found" }, status=status.HTTP_400_BAD_REQUEST)

            serializer = ChangeUserInfoSerializer(user, data=request.data, partial=True)

            if serializer.is_valid():

                serializer.save()

                return Response(
                    { "success": True },
                    status=status.HTTP_200_OK
                )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(e)
            return Response({ "error": "Internal Server Error" }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

