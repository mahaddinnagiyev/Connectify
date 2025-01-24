from rest_framework import serializers
from .models import User


# Change User Username Serializer
class ChangeUserInfoSerializer(serializers.ModelSerializer):

    class Meta:

        model = User
        fields = ['first_name','last_name', 'username', 'gender']

    def validate_username(self, value):

        if User.objects.filter(username=value):
            raise serializers.ValidationError({"validation_error": "This username already taken"})
        return value

    def update(self, instance, validated_data):

        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.username = validated_data.get('username', instance.username)
        instance.gender = validated_data.get('gender', instance.gender)

        instance.save()
        return instance