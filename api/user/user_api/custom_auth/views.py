from Custom_Widgets import Object
from rest_framework import status
from django.db import DatabaseError
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password

# Rate Limiter
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator

# Serializer
from .serializers import SignupSerializer

# Models
from user.models import User


# Auth View Set
class AuthViewSet(ViewSet):

    @method_decorator(ratelimit(key='ip', rate='20/m', block=False))
    def singup(self, request):

        # If rate-limited
        if getattr(request, 'limited', False):
            return Response(
                { "error": "Too many requests. Please try again later" },
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        serializer = SignupSerializer(data=request.data)

        if serializer.is_valid():
            try:
                data = serializer.validated_data

                hashed_password = make_password(data["password"])

                user = User.objects.create(
                    first_name=data["first_name"],
                    last_name=data["last_name"],
                    username=data["username"],
                    email=data["email"],
                    gender=data["gender"],
                    password=hashed_password
                )

                return Response(
                    {
                        "success": "True",
                        "user": {
                            "first_name": user.first_name,
                            "last_name": user.last_name,
                            "username": user.username,
                            "email": user.email,
                            "gender": user.gender,
                        }
                    },
                    status=status.HTTP_201_CREATED
                )

            except DatabaseError as db_error:
                return Response(
                    { "error": f"Database Error: f{db_error}" },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            except Exception as e:
                return Response(
                    { "error": "Internal Server Error" },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

