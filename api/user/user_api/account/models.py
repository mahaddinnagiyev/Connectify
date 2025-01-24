from django.db import models
from uuid import uuid4
from user.models import User, AbstrasctModel


class Account(AbstrasctModel):

    id = models.UUIDField(
        primary_key=True,
        default=uuid4,
        editable=False
    )
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        null=False
    )
    bio = models.CharField(
        max_length=255,
        null=True,
        verbose_name="Biography"
    )
    location = models.CharField(
        max_length=255,
        null=True,
        verbose_name="Location"
    )
    profile_pic = models.ImageField(
        upload_to="profile_pictures/",
        null=True,
        verbose_name="Profile Picture"
    )
    last_login = models.DateTimeField(
        auto_now=True,
        verbose_name="Last Login"
    )
    social_links = models.JSONField(
        null=True,
        verbose_name="Social Links"
    )

    class Meta:
        ordering = ["id"]


