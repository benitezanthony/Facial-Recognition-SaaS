import stripe
from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractUser
''' when we signup, we need to create stripe customer and membership, meaning
we need to use post_save db signal'''
from django.db.models.signals import post_save
from django.utils import timezone


''' apikey imported from dev.py and obtained from stripe dashboard'''
stripe.api_key = settings.STRIPE_SECRET_KEY

MEMBERSHIP_CHOICES = (
    ('F', 'free_trial'),
    ('M', 'member'),
    ('N', 'not_member'),
)


class File(models.Model):
    file = models.ImageField()

    def __str__(self):
        return self.file.name

# to use class User, we must add it to our settings inside base.py as follows:
# AUTH_USER_MODEL = 'core.User'


class User(AbstractUser):
    is_member = models.BooleanField(default=False)
    on_free_trial = models.BooleanField(default=True)
    stripe_customer_id = models.CharField(max_length=40)


class Membership(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=1, choices=MEMBERSHIP_CHOICES)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    stripe_subscription_id = models.CharField(
        max_length=40, blank=True, null=True)
    stripe_subscription_item_id = models.CharField(
        max_length=40, blank=True, null=True)

    def __str__(self):
        return self.user.username


class Payment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    amount = models.FloatField()

    def __str__(self):
        return self.user.username


class TrackedRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    endpoint = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
    # if user on free trial, we don't assign record id (blank, null)
    usage_record_id = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.user.username


# when a user first signs up, all these details are created
def post_save_user_receiver(sender, instance, created, *args, **kwargs):
    ''' if user being created/saved, create customer and membership '''
    if created:
        import datetime
        ''' customer is the return of the API call '''
        customer = stripe.Customer.create(email=instance.email)
        ''' instance or actual user model '''
        instance.stripe_customer_id = customer.id
        instance.save()

        membership = Membership.objects.get_or_create(
            # coming from this model
            user=instance,
            type='F',
            start_date=timezone.now(),
            # free trial lasts 2 weeks
            end_date=timezone.now() + datetime.timedelta(days=14)
        )


''' link receiver to post_save '''
post_save.connect(post_save_user_receiver, sender=User)
