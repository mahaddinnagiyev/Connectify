from django.conf import settings
from rest_framework import status
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_500_INTERNAL_SERVER_ERROR
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response

# Hash Password
from django.contrib.auth.hashers import make_password

# Rate Limiter
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from django.core.cache import cache

# Serializer
from .serializers import SignupSerializer, ConfirmSerializer, LoginSerializer, CustomTokenSerializer

# Models
from user.models import User

# Email
from django.core.mail import send_mail

# Utils
from user_api.utils import generate_code
from user_api.utils.messages import confirm_message


# Auth View Set
class AuthViewSet(ViewSet):

    # Signup
    @method_decorator(ratelimit(key='ip', rate='20/m', block=False))
    def signup(self, request):

        # If rate-limited
        if getattr(request, 'limited', False):
            return Response(
                { "error": "Too many requests. Please try again later" },
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        try:

            serializer = SignupSerializer(data=request.data)

            if serializer.is_valid():
                    data = serializer.validated_data

                    confirm_code = generate_code.generate_confirm_code()

                    unconfirmed_user = {
                        "first_name": data["first_name"],
                        "last_name": data["last_name"],
                        "username": data["username"],
                        "email": data["email"],
                        "gender": data["gender"],
                        "password": data["password"],
                    }

                    request.session["unconfirmed_user"] = unconfirmed_user
                    request.session["confirm_code"] = confirm_code

                    send_mail(
                        "Confirm Your Connectify Account",
                        confirm_message.send_confirmation_code_email(
                            data["first_name"],
                            data["last_name"],
                            confirm_code
                        ),
                        settings.EMAIL_HOST_USER,
                        [data["email"]]
                    )

                    return Response(
                        {
                            "success": "True",
                            "message": "Confirmation code sent. Please check your email inbox."
                        },
                        status=status.HTTP_201_CREATED
                    )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(e)
            return Response({ "error": "Internal Server Error" }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Confirm Account
    @method_decorator(ratelimit(key='ip', rate='10/m', block=False))
    def confirm(self, request):

        # If rate-limited
        if getattr(request, 'limited', False):
            return Response(
                {"error": "Too many requests. Please try again later"},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        try:
            serializer = ConfirmSerializer(data=request.data)

            if serializer.is_valid():

                code = serializer.validated_data["code"]
                confirm_code = request.session.get("confirm_code")
                unconfirmed_user = request.session.get("unconfirmed_user")

                if unconfirmed_user is None:
                    return Response(
                        {"error": "There is no data about user"},
                        status=HTTP_400_BAD_REQUEST
                    )

                if confirm_code is None:
                    return Response(
                        {"error": "Confirm code has been expired or this user already registered"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                if code != confirm_code:
                    return Response(
                        {"error": "Invalid code"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                hashed_password = make_password(unconfirmed_user["password"])

                user = User.objects.create(
                    first_name=unconfirmed_user["first_name"],
                    last_name=unconfirmed_user["last_name"],
                    username=unconfirmed_user["username"],
                    email=unconfirmed_user["email"],
                    gender=unconfirmed_user["gender"],
                    password=hashed_password
                )

                del request.session["confirm_code"]
                del request.session["unconfirmed_user"]

                return Response(
                    {
                        "success": True,
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

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(e)
            return Response({ "error": "Internal Server Error" }, status=HTTP_500_INTERNAL_SERVER_ERROR)

    # Login
    @method_decorator(ratelimit(key='ip', rate='20/m', block=False))
    def login(self, request):

        # If rate-limited
        if getattr(request, 'limited', False):
            return Response(
                {"error": "Too many requests. Please try again later"},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )


        try:
            serializer = LoginSerializer(data=request.data)

            ip = self.get_client_ip(request)

            if not serializer.is_valid():

                failures = cache.get(f"failed_logins_{ip}", 0) + 1
                cache.set(f"failed_logins_{ip}", failures, timeout=90)

                if failures > 5:
                    cache.set(f"blocked_{ip}", True, timeout=90)
                    return Response(
                        { "error": "Too many fail login attempts. Please try again later with correct credentials" },
                        status=status.HTTP_429_TOO_MANY_REQUESTS
                    )

                return Response(
                    serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST
                )

            is_blocked = cache.get(f"blocked_{ip}")
            if is_blocked:
                return Response(
                    {"error": "Too many failed login attempts. Your IP is blocked for 90 seconds."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

            user = serializer.validated_data["user"]
            token = CustomTokenSerializer.get_token(user)

            cache.delete(f"failed_logins_{ip}")

            return Response(
                {
                    "success": True,
                    "access_token": str(token),
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            print(e)
            return Response({ "error": "Internal Server Error" })

    # Get Client's IP
    def get_client_ip(self, request):

        """
            Handling client ip by request
        """
        x_forwarded_to = request.META.get('HTTP_X_FORWARDED_FOR')

        if x_forwarded_to:
            ip = x_forwarded_to.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')

        return ip
