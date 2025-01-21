from django.db import models
from uuid import uuid4
from django.core.validators import  MinLengthValidator, MaxLengthValidator


# Abstract Model
class AbstrasctModel(models.Model):

    created_at = models.DateTimeField(
        blank=True,
        auto_now_add=True,
        verbose_name='Created Date'
    )
    updated_at = models.DateTimeField(
        blank=True,
        auto_now=True,
        verbose_name="Update Date"
    )

    class Meta:
        abstract=True


# User Model
class User(AbstrasctModel):

    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid4,
        editable=False
    )
    first_name = models.CharField(
        verbose_name="First Name",
        null=False,
        validators=[MinLengthValidator(2), MaxLengthValidator(255)]
    )
    last_name = models.CharField(
        verbose_name="Last Name",
        null=False,
        validators=[MinLengthValidator(2), MaxLengthValidator(255)]
    )
    username = models.CharField(
        verbose_name="Username",
        null=False,
        validators=[MinLengthValidator(1), MaxLengthValidator(255)]
    )
    email = models.EmailField(
        verbose_name="Email",
        null=False,
        validators=[MinLengthValidator(10), MaxLengthValidator(255)]
    )
    gender = models.CharField(
        choices=GENDER_CHOICES,
        verbose_name="Gender",
        null=False,
        validators=[MinLengthValidator(1), MaxLengthValidator(1)]
    )
    password = models.CharField(
        verbose_name="Password",
        null=False,
        validators=[MinLengthValidator(8), MaxLengthValidator(255)]
    )
    reset_token = models.CharField(
        verbose_name="Reset Token",
        null=True,
        validators=[MaxLengthValidator(64)]
    )
    reset_token_expiration = models.DateTimeField(
        verbose_name="Reset Token Expiration",
        null=True
    )

    class Meta:
        ordering = ["id"]
