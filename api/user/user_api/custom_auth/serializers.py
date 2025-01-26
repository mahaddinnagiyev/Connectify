from rest_framework import serializers
from user.models import User
import re
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import AccessToken, Token
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, AuthUser
from django.conf import settings


# Signup Serializer
class SignupSerializer(serializers.ModelSerializer):

    gender = serializers.ChoiceField(
        choices=User.GENDER_CHOICES
    )
    confirm = serializers.CharField(
        write_only=True,
        required=True
    )

    class Meta:

        model = User
        fields = ['first_name', 'last_name', 'username', 'email', 'gender', 'password', 'confirm']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def validate_password(self, value):

        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError({ "validation_error": "Password must contain at least one lowercase letter." })
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError({ "validation_error": "Password must contain at least one uppercase letter." })
        if not re.search(r'\d', value):
            raise serializers.ValidationError({ "validation_error": "Password must contain at least one digit." })
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError({ "validation_error": "Password must contain at least one special character." })
        return value

    def validate_confirm(self, value):

        password = self.initial_data.get("password")

        if password != value:
            raise serializers.ValidationError({ "validation_error": "Passwords does not match." })

        return value

    def validate_username(self, value):

        if User.objects.filter(username=value):
            raise serializers.ValidationError({ "validation_error": "This username already taken" })
        return value

    def validate_email(self, value):

        if User.objects.filter(email=value):
            raise serializers.ValidationError({"validation_error": "This email already registered"})
        return value


# Confirm Account Serializer
class ConfirmSerializer(serializers.Serializer):

    code = serializers.IntegerField(
        min_value=100000,
        max_value=999999,
        required=True
    )

    def validate_code(self, value):

        if (value < 0) or (len(str(value)) != 6):
            raise serializers.ValidationError({ "error": "Please write valid code" })

        return value


# Login Serializer
class LoginSerializer(serializers.Serializer):

    username_or_email = serializers.CharField(
        max_length=255,
        required=True
    )
    password = serializers.CharField(
        max_length=255,
        required=True,
        write_only=True
    )

    def validate(self, data):

        username_or_email = data.get("username_or_email")
        password = data.get("password")

        user = None
        if "@" in username_or_email and "." in username_or_email:
            user = User.objects.filter(email=username_or_email).first()

        else:
            user = User.objects.filter(username=username_or_email).first()

        if user is None:
            raise serializers.ValidationError({ "error": "Invalid credentials. Please try again" })

        if not check_password(password, user.password):
            raise serializers.ValidationError({ "error": "Invalid credentials. Please try again" })

        return { "user": user }


# Custom Access Token Serializer
class CustomTokenSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = AccessToken.for_user(user)

        token['user_id'] = str(user.id)
        token.set_exp(lifetime=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"])
        return token
