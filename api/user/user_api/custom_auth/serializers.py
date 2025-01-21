from rest_framework import serializers
from user.models import User
import re

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
        fields = ['first_name', 'last_name', 'username', 'email', 'gender', 'password']
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

    def validate_confirm(self, data):

        password = data.get("password")
        confirm = data.get("confirm")

        if password != confirm:
            raise serializers.ValidationError({ "validation_error": "Passwords does not match." })

        return data

    def validate_username(self, value):

        if User.objects.get(username=value):
            raise serializers.ValidationError({ "validation_error": "This username already taken" })
        return value

    def validate_email(self, value):

        if User.objects.get(email=value):
            raise serializers.ValidationError({"validation_error": "This email already registered"})
        return value
