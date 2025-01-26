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
        unique=True,
        validators=[MinLengthValidator(1), MaxLengthValidator(255)]
    )
    email = models.EmailField(
        verbose_name="Email",
        null=False,
        unique=True,
        validators=[MinLengthValidator(10), MaxLengthValidator(255)]
    )
    is_admin = models.BooleanField(
        default=False
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
    friend_list = models.ManyToManyField(
        'self',
        symmetrical=False,
        through='Friend',
        related_name="friends",
        verbose_name="Friends"
    )

    class Meta:
        ordering = ["id"]


# Friendship Model
class Friend(models.Model):

    STATUS_CHOICES = (
        ('Y', 'Accept'),
        ('F', 'Reject'),
        ('P', 'Pending')
    )
    id = models.UUIDField(
        primary_key=True,
        default=uuid4,
        editable=False
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="friendships_initiated",
        verbose_name="friends"
    )
    friend_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="friendships_received",
        verbose_name="friend_of"
    )
    status = models.CharField(
        choices=STATUS_CHOICES,
        verbose_name="friendship_status",
        max_length=1,
        default='P'
    ),
    created_at = models.DateTimeField(
        blank=True,
        auto_now_add=True,
        verbose_name='Created Date'
    )

    class Meta:
        ordering = ["id"]
        unique_together = ('user', 'friend_user')