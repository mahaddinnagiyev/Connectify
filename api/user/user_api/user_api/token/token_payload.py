from functools import wraps
from django.http import JsonResponse
import jwt
from django.conf import settings
from user.models import User
from rest_framework import status
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class CustomJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        token = request.headers.get('Authorization', None)

        if not token:
            raise AuthenticationFailed('No token provided')

        try:
            if token.startswith('Bearer '):
                token = token[7:]

            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user = User.objects.filter(id=(payload['user_id'])).first()

            if not user:
                raise AuthenticationFailed('Invalid user')

            return user, token
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.DecodeError:
            raise AuthenticationFailed('Error decoding token')


def jwt_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        try:
            user, token = CustomJWTAuthentication().authenticate(request)

            if user:
                request.user = user
                return view_func(request, *args, **kwargs)
        except Exception as e:
            print(e)
            return JsonResponse({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

    return _wrapped_view
