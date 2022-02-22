from re import T
from django.contrib.auth.models import AbstractUser, Group
from django.db import models
from django.conf import settings
from django.core.validators import validate_comma_separated_integer_list
from django.db.models.fields import related
from simple_history.models import HistoricalRecords


class QMUser(AbstractUser):
    pass


'''
 Super admin,
 c support admin
 fin admin,
 Public,
 Vendor,
 Del. Agent
'''

USER_TYPE_CHOICES = (
    ('A', 'Admin'),
    ('D', 'Doctors'),
    ('C', 'Customer'),
    ('I', 'Driver'),
)


class UserProfile(models.Model):
    user = models.OneToOneField(
        QMUser, related_name='profile', on_delete=models.CASCADE)
    user_type = models.CharField(max_length=5, choices=USER_TYPE_CHOICES)
    address_line1 = models.CharField(max_length=500, null=True)
    address_line2 = models.CharField(max_length=500, null=True)
    city = models.CharField(max_length=150, null=True)
    state = models.CharField(max_length=150, null=True)
    country = models.CharField(max_length=100, null=True, default='IN')
    pin_code = models.CharField(max_length=100, null=True)
    mobile = models.BigIntegerField(null=True)
    subscription_active_at = models.DateTimeField(null=True)
    amount = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name='created_by', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    document_verified = models.BooleanField(default=False)
    document_rejected = models.BooleanField(default=False)
    clinic_name = models.CharField(max_length=100, null=True)
    clinic_registeration_no = models.CharField(max_length=100, null=True)
    doctor_registeration_no = models.CharField(max_length=100, null=True)

    agreement_file = models.FileField(
        upload_to='customer/agreement/%Y-%m-%d-%H-%M-%S', blank=True, null=True)

    your_sign = models.ImageField(
        upload_to='customer/agreement/%Y-%m-%d-%H-%M-%S', blank=True, null=True)

    degree_certificate = models.FileField(
        upload_to='customer/degree/%Y-%m-%d-%H-%M-%S', blank=True, null=True)
    doctor_registration = models.FileField(
        upload_to='customer/doctor_regi/%Y-%m-%d-%H-%M-%S', blank=True, null=True)
    clinic_address_proof = models.FileField(
        upload_to='customer/clinic_adress/%Y-%m-%d-%H-%M-%S', blank=True, null=True)

    role_id = models.CharField(max_length=100, validators=[
                               validate_comma_separated_integer_list], null=True)
    history = HistoricalRecords()

    doctors_whitelist = models.ManyToManyField(
        QMUser, related_name="customers_access")


class Roles(models.Model):
    group = models.OneToOneField(
        Group, related_name='details', on_delete=models.CASCADE)
    alias = models.CharField(max_length=50)
    accesses = models.TextField(null=True)
    description = models.TextField(null=True)
    created_by = models.ForeignKey(
        QMUser, to_field='id', null=True, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    history = HistoricalRecords()


class PasswordResetTokens(models.Model):
    user = models.ForeignKey(QMUser, related_name="+",
                             on_delete=models.CASCADE)
    token = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class AccessRequest(models.Model):
    requested_by = models.ForeignKey(
        QMUser, related_name="requests", on_delete=models.CASCADE)
    status = models.CharField(max_length=250, default="pending")
    requested_for = models.ForeignKey(
        QMUser, related_name="my_requests", on_delete=models.CASCADE)


class Review(models.Model):
    doctor = models.ForeignKey(
        QMUser, related_name="reviews", on_delete=models.CASCADE)
    review_text = models.CharField(max_length=2000)
    created_by = models.ForeignKey(
        QMUser, related_name="sent_reviews", on_delete=models.CASCADE)


# Appoitment Model
class AppointmentModel(models.Model):
    appointmentDate = models.DateField()
    charges = models.PositiveIntegerField()
    patient = models.ForeignKey(
        QMUser, on_delete=models.CASCADE, related_name="appointments")

    doctor = models.ForeignKey(
        QMUser, on_delete=models.CASCADE, related_name="d_appointments")


# Appoitment Time Slots Model


class TimeSlot(models.Model):
    choices = (("Monday", "Monday"),
               ("Tuesday", "Tuesday"),
               ("Wednesday", "Wednesday"),
               ("Thursday", "Thursday"),
               ("Friday", "Friday"),
               ("Saturday", "Saturday"),
               )
    day = models.CharField(max_length=255, choices=choices)
    start_time = models.TimeField()
    end_time = models.TimeField()

    doctor = models.ForeignKey(
        QMUser, on_delete=models.CASCADE, related_name="daytimeslots")


class DateTimeSlot(models.Model):
    date = models.DateField(blank=False, null=False)
    start_time = models.TimeField()
    end_time = models.TimeField()

    doctor = models.ForeignKey(
        QMUser, on_delete=models.CASCADE, related_name="datetimeslots")



# Invoice
class BillingInvoice(models.Model):
    billing_date=models.DateTimeField(auto_now_add=True)
    appointment_date=models.DateField()