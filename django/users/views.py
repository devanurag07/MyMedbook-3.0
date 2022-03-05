import datetime
from os import remove, stat, times
from pstats import Stats
from re import T
import re
from shutil import ReadError
from django.contrib.auth.decorators import permission_required
from django.contrib.auth.models import Group
from django.db.models import Q
from django.db.models.query import QuerySet
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from rest_framework import permissions
from rest_framework import viewsets, status
from rest_framework import response
from rest_framework.decorators import action, permission_classes
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_jwt.serializers import User, VerifyJSONWebTokenSerializer
from rest_framework_jwt.settings import api_settings
from sqlalchemy import alias
from common.models import OtpRequests
from common.fastsms import send_message
from users.serializers import UserSerializerReadOnly
from users.models import DoctorTag
from users.serializers import TagSerializer
from queues.models import BillingInvoice
from users.serializers import BillingInvoiceSerializer
# from django.users.permissions import IsDoctor
from users.permissions import IsDoctor
from users.models import AppointmentModel, DateTimeSlot, TimeSlot, UserProfile
from users.models import Review
from users.serializers import AccessRequestSerializer, AppoitmentSerializer, DateTimeSlotSerializer, TimeSlotSerializer
from queues.models import Prescription
from queues.serializers import PrescriptionSerializer
from generics.constants import CUSTOMERS_USER_TYPE
from generics.constants import Doctors_USER_TYPE
from generics.Mailer import Mailer
from generics.custom_exceptions import CustomValidationErr
from generics.defaults import AppDefaults
from users.models import QMUser, PasswordResetTokens, Roles
from users.serializers import UsersSerializer, GroupSerializer
from users.models import AccessRequest
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.files.base import ContentFile

import random

from io import BytesIO
import datetime


def jwt_response_payload_handler(token, user=None, request=None):
    """ Modifying jwt login response details """
    user_details = UsersSerializer(user, context={'request': request}).data

    """ Fetching assigned accesses for the use """
    user_details['accesses'] = list()

    if user.is_superuser:
        user_details['accesses'] = AppDefaults.get_predefined_role_access_specifiers(
            'Admin')
    else:
        access_joined = user.groups.all().values_list('details__accesses', flat=True)
        for string in access_joined:
            if string is not None:
                user_details['accesses'] += string.split(',')
        user_details['accesses'] = list(set(user_details['accesses']))

    user_details['accesses'] = sorted(user_details['accesses'])

    return {
        'token': token,
        'user': user_details
    }


@method_decorator(permission_required('users.view_qmuser', raise_exception=True), name='list')
@method_decorator(permission_required('users.view_qmuser', raise_exception=True), name='retrieve')
@method_decorator(permission_required('users.add_qmuser', raise_exception=True), name='create')
@method_decorator(permission_required('users.change_qmuser', raise_exception=True), name='update')
@method_decorator(permission_required('users.change_qmuser', raise_exception=True), name='partial_update')
@method_decorator(permission_required('users.delete_qmuser', raise_exception=True), name='destroy')
class UsersViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = QMUser.objects.all()
    serializer_class = UsersSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            query_set = QMUser.objects.all()
        else:
            query_set = self.queryset.filter(profile__created_by=user)
        return query_set

    def destroy(self, request, *args, **kwargs):
        # self.get_queryset().filter(id=kwargs['pk']).update(is_active=0)
        QMUser.objects.filter(id=kwargs['pk']).delete()
        return Response(True)

    @action(methods=['post'], detail=False, url_path='check-username')
    def check_user_list(self, request, *args, **kwargs):
        user_name = request.data['username']
        queryset = QMUser.objects.filter(username=user_name)
        check_exist = len(queryset)
        return Response(check_exist)

    @action(methods=['get'], detail=False, url_path='get-customers')
    def get_customers(self, request, *args, **kwargs):
        from generics.constants import CUSTOMERS_USER_TYPE
        user_role = Roles.objects.filter(alias=CUSTOMERS_USER_TYPE).first()
        # query_set = QMUser.objects.filter(
        #     profile__role_id=user_role.id, profile__created_by=self.request.user)

        query_set = QMUser.objects.all().exclude(id=request.user.id)

        query_params = request.query_params.dict()
        search_text = query_params.pop('searchText', None)
        if search_text is not None:
            query_set = query_set.filter(
                Q(first_name__icontains=search_text) |
                Q(profile__mobile__icontains=search_text) |
                Q(email__icontains=search_text) |
                Q(last_name__icontains=search_text))
        values = query_set.values('id', 'first_name')
        return Response(values)

    # //Admin Views
    @action(methods=["get"], detail=False, url_path="get-doctors")
    def get_doctors(self, request, pk=None, *args, **kwargs):

        from generics.constants import Doctors_USER_TYPE
        user_role = Roles.objects.filter(alias=Doctors_USER_TYPE).first()
        query_set = QMUser.objects.filter(
            profile__role_id=user_role.id)

        serializer = UsersSerializer(
            query_set, many=True, context={"request": request})

        return Response({'records': serializer.data, 'totalRecords':  query_set.count()})

    def create(self, request, *args, **kwargs):
        request.data['user_id'] = request.user.id
        from django.utils.crypto import get_random_string
        if 'role_id' not in request.data:
            user_role = Roles.objects.filter(alias='Customers').first()
            request.data['user_type'] = 'Customers'
            request.data['role_id'] = user_role.id

        mobile = request.data.get("mobile", None)
        if(not mobile == None):
            mobile_exits = UserProfile.objects.filter(mobile=mobile).exists()

            if(mobile_exits):
                return Response({'mobileExists': True}, status=status.HTTP_401_UNAUTHORIZED)

        password = get_random_string(length=7)
        request.data['password'] = password
        user = super(self.__class__, self).create(request, *args, **kwargs)
        user_id = user.data['id']
        u = QMUser.objects.get(pk=user_id)
        u.set_password(password)
        u.save()
        serializer = self.serializer_class(u, context={'request': request})
        user_data = serializer.data
        if 'customer' in request.data:
            from common.fastsms import send_message
            message = 'Dear %s, a warm welcome to MyMedbook. One place to manage all your health records.\n\nLogin details \n Username: %s \nPassword: %s \n\nTeam MyMedbook' \
                      % (user_data['first_name'], user_data['username'], password)
            data = send_message(user_data['mobile'], message)
            if data.status_code == 200:
                json_data = data.json()
                return Response({'fast2sms': json_data, 'user': user_data})
            else:
                Response(True)
        return Response(True)

    def update(self, request, *args, **kwargs):
        user_id = kwargs['pk']
        password = request.data['password']
        request.data.pop('password', None)
        super(self.__class__, self).update(request, *args, **kwargs)
        u = QMUser.objects.get(pk=user_id)
        if u.password != password:
            u.set_password(password)
            u.save()
        return Response(True)

    @action(methods=['post'], detail=False, url_path='update-profile')
    def update_profile(self, request):
        user = self.request.user
        user.first_name = request.data['first_name']

        email = request.data['email']
        mobile = request.data["mobile"]

        errors = {
            'emailExists': False,
            'mobileExists': False,

        }

        if(QMUser.objects.filter(email=email).exists()):
            errors['emailExists'] = True
        if(QMUser.objects.filter(profile__mobile=mobile)):
            errors['mobileExists'] = True

        user.save()
        if hasattr(user, 'profile'):
            profile = user.profile
        else:
            from users.models import UserProfile
            user_role = Roles.objects.filter(alias='Admin').first()
            profile = UserProfile()
            profile.user = user
            profile.role_id = user_role.id
            profile.user_type = 'Admin'
            profile.created_by = QMUser.objects.first()

        if(not errors['emailExists']):
            user.email = email
            user.save()

        if(not errors['mobileExists']):
            profile.mobile = request.data['mobile']
            profile.save()

        profile.address_line1 = request.data['address_line1']

        if 'agreement_file' in request.FILES:
            profile.agreement_file = request.FILES['agreement_file']
            profile.document_rejected = False

        if 'degree_certificate' in request.FILES:
            profile.degree_certificate = request.FILES['degree_certificate']

        if 'doctor_registration' in request.FILES:
            profile.doctor_registration = request.FILES['doctor_registration']

        if 'clinic_address_proof' in request.FILES:
            profile.clinic_address_proof = request.FILES['clinic_address_proof']

        if 'clinic_name' in request.data:
            profile.clinic_name = request.data['clinic_name']

        if 'clinic_registeration_no' in request.data:
            profile.clinic_registeration_no = request.data['clinic_registeration_no']

        if 'doctor_registeration_no' in request.data:
            profile.doctor_registeration_no = request.data['doctor_registeration_no']

        if 'your_sign' in request.FILES:
            img = request.FILES['your_sign']
            # from PIL import Image
            # img = Image.open(img)
            # img.thumbnail((50, 50))
            # buffer = BytesIO()

            # img.save(fp=buffer, format="svg")

            # img_file = ContentFile(buffer.getvalue())

            # img_uploaded_file = InMemoryUploadedFile(
            #     img_file, 'your_sign', f"image-{str(request.user.username)}", "image/svg", img_file.tell, None)

            profile.your_sign = img

        profile.save()
        user_details = UsersSerializer(user, context={'request': request}).data
        user_details["errors"] = errors
        return Response(user_details)

    @action(methods=['post'], detail=False, url_path='update-customer')
    def update_customer(self, request):
        user = QMUser.objects.get(id=request.data['id'])
        user.first_name = request.data['first_name']
        user.username = request.data['email']
        user.email = request.data['email']
        user.save()
        profile = user.profile
        profile.mobile = request.data[' mobile']
        profile.address_line1 = request.data['address_line1']
        profile.save()
        user_details = UsersSerializer(user, context={'request': request}).data
        return Response(user_details)

    @action(methods=['post'], detail=False, url_path='activate-customer')
    def activate_customer(self, request):
        user = QMUser.objects.get(id=request.data['id'])
        profile = user.profile
        profile.document_verified = True
        profile.document_rejected = False
        profile.save()
        return Response(True)

    @action(methods=['post'], detail=False, url_path='reject-customer')
    def reject_customer(self, request):
        user = QMUser.objects.get(id=request.data['id'])
        profile = user.profile
        profile.document_rejected = True
        profile.document_verified = False
        profile.save()
        return Response(True)

    @action(methods=['post'], detail=False, url_path='change-password')
    def change_password(self, request):
        user = self.request.user
        old_password = request.data['old_password']
        from django.contrib.auth import authenticate
        credentials = {
            'email': user.email,
            'password': old_password
        }
        user = authenticate(**credentials)
        if user:
            user.set_password(request.data['password'])
            user.save()

            return Response({'msg': "Your Password changed"})
        else:
            return Response({'msg': "Your old password was entered incorrectly"}, status=400)

    def list(self, request, *args, **kwargs):
        query_params = request.query_params.dict()
        offset = int(query_params.pop('offset', 0))
        end = int(query_params.pop('limit', 5))
        username_list = [request.user.username, 'AnonymousUser']
        queryset = self.get_queryset().filter(
            is_active=1).exclude(username__in=username_list)

        order_by = query_params.pop('order_by', None)
        search_text = query_params.pop('searchText', None)
        customer = query_params.pop('customer', None)
        document_verification = query_params.pop('documentVerification', None)
        query_set = queryset

        if search_text is not None:
            query_set = query_set.filter(
                Q(first_name__icontains=search_text) |
                Q(email__icontains=search_text) |
                Q(last_name__icontains=search_text))

        from generics.constants import CUSTOMERS_USER_TYPE, Doctors_USER_TYPE
        user_role = Roles.objects.filter(alias=CUSTOMERS_USER_TYPE).first()
        doctor_role = Roles.objects.filter(alias=Doctors_USER_TYPE).first()
        if customer is not None:
            query_set = query_set.filter(
                profile__role_id=user_role.id) | query_set.filter(
                profile__role_id=doctor_role.id)
        else:
            query_set = query_set.exclude(profile__role_id=user_role.id)

        if document_verification is not None:
            query_set = query_set.filter(profile__role_id=doctor_role.id)
            query_set = query_set.order_by("-profile__created_at")
        if order_by is not None:
            if order_by == 'full_name' or order_by == '-full_name':
                order_by = order_by.replace('full_name', 'first_name')
            query_set = query_set.order_by(order_by)

        total_records = query_set.filter(is_active=1).count()
        query_set = query_set[offset:end]
        serializer = UsersSerializer(
            query_set, many=True, context={'request': request})
        return Response({'records': serializer.data, 'totalRecords': total_records})


class GroupsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = GroupSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Group.objects.none()
        if user.is_superuser:
            queryset = Group.objects.filter((Q(details__created_by=user) | Q(details__created_by=None))) \
                .exclude(details__alias__isnull=True)
        else:
            queryset = Group.objects.filter(
                details__created_by=user).exclude(details__alias__isnull=True)

        return queryset.order_by('details__alias')

    @action(methods=['get'], detail=True, url_path='delete_role')
    def delete_role_check(self, request, **kwargs):
        role_id = kwargs["pk"]
        role_name = Group.objects.get(id=role_id)
        user_list = role_name.user_set.exclude(is_active=0).all()
        user = user_list.exists()
        predefined = AppDefaults.get_predefined_roles()
        predefined_value = role_name.name in predefined.values()
        if predefined_value:
            return Response(False)
        elif user:
            return Response("exists")
        else:
            return Response(True)

    def destroy(self, request, *args, **kwargs):
        id = kwargs["pk"]
        query = self.get_queryset().get(id=id)
        query.details.delete()
        queryset = self.get_queryset()
        serializer = GroupSerializer(
            queryset, many=True, context={'request': request})
        return Response(serializer.data)


class AdminViewset(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UsersSerializer

    def get_queryset(self):
        queryset = QMUser.objects.all()
        return queryset

    @action(methods=["get"], detail=True, url_path="get-doctor")
    def get_doctor(self, request, pk=None, *args, **kwargs):
        doctor_role = Roles.objects.filter(alias=Doctors_USER_TYPE).first()
        doctor = QMUser.objects.filter(
            profile__role_id=doctor_role.id, id=pk).first()

        return Response(UsersSerializer(doctor, context={"request": request}).data)

    @action(methods=["get"], detail=False, url_path="get-customers")
    def get_customers(self, request, pk=None, *args, **kwargs):

        customer_role = Roles.objects.filter(alias=CUSTOMERS_USER_TYPE).first()
        customers = QMUser.objects.filter(profile__role_id=customer_role.id)

        serializer = UsersSerializer(
            customers, many=True, context={"request": request})

        return Response({'records': serializer.data, 'totalRecords':  customers.count()})

    @action(methods=["get"], detail=True, url_path="get-customer")
    def get_customer(self, request, pk=None, *args, **kwargs):

        customer_role = Roles.objects.filter(alias=CUSTOMERS_USER_TYPE).first()
        customer = QMUser.objects.filter(
            profile__role_id=customer_role.id, id=pk).first()

        access_request = AccessRequest.objects.filter(
            requested_by=request.user, requested_for=customer).first()

        is_admin = request.user.is_superuser

        if(not is_admin):
            if(access_request):
                access_status = access_request.status
                if(access_status == "has_access"):
                    print('hAS access')
                else:
                    return Response({}, status=status.HTTP_401_UNAUTHORIZED)
            else:
                return Response({}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = UsersSerializer(
            customer, context={"request": request})

        return Response({'data': serializer.data})

    @action(methods=["get"], detail=True, url_path="get-prescription")
    def get_prescription(self, request, pk=None, *args, **kwargs):

        prescription = get_object_or_404(Prescription, id=pk)

        if(request.user.is_superuser):
            data = PrescriptionSerializer(prescription).data
            return Response({'data': data})

        elif (prescription.customer == request.user):
            data = PrescriptionSerializer(prescription).data
            return Response({'data': data})

        elif (prescription.created_by == request.user):
            data = PrescriptionSerializer(prescription).data
            return Response({'data': data})

        else:
            access = get_object_or_404(
                AccessRequest, requested_by=request.user, requested_for=prescription.customer)

            if(access.status == "has_access" or request.user == prescription.customer):
                data = PrescriptionSerializer(prescription).data
                data["doctor_name"] = "x.x.x"

                return Response({'data': data})

            return Response("No Permission", status=status.HTTP_401_UNAUTHORIZED)

        return Response({})


class UserMViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UsersSerializer

    def get_queryset(self):
        queryset = QMUser.objects.all()
        return queryset

    @action(methods=["get"], detail=False, url_path="get-myrecords")
    def get_myrecords(self, request, *args, **kwargs):
        usr = request.user
        queryset = usr.prescription_customer_details.all()
        data = PrescriptionSerializer(queryset, many=True).data

        return Response(data)

    @action(methods=["get"], detail=False, url_path="get-myrequests")
    def get_myrequests(self, request, *args, **kwargs):

        usr = request.user
        queryset = AccessRequest.objects.filter(
            requested_for=usr).order_by("-id")
        data = AccessRequestSerializer(queryset, many=True).data

        return Response({"records": data, "totalRecords": queryset.count()})

    @action(methods=["post"], detail=True, url_path="accept-request")
    def accept_request(self, request, pk=None, *args, **kwargs):

        access_request = get_object_or_404(AccessRequest, pk=pk)
        currentUser = request.user

        if(access_request.requested_for == currentUser):
            access_request.status = "has_access"
            access_request.save()

            return Response({"status": "has_access"})
        else:
            return Response({"status": "access_denied"}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["post"], detail=True, url_path="deny-request")
    def deny_request(self, request, pk=None, *args, **kwargs):

        access_request = get_object_or_404(AccessRequest, pk=pk)
        currentUser = request.user

        if(access_request.requested_for == currentUser):
            access_request.status = "rejected"
            access_request.save()

            return Response({"status": "rejected"})
        else:
            return Response({"status": "None"}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["post"], detail=True, url_path="send-review")
    def send_review(self, request, pk=None, *args, **kwargs):

        doctor = get_object_or_404(QMUser, pk=pk)
        access = get_object_or_404(
            AccessRequest, requested_by=doctor, requested_for=request.user)

        if(access):
            review_text = request.data.get('review_text')
            review = Review(review_text=review_text,
                            doctor=doctor, created_by=request.user)

            review.save()
            return Response({'status': "submitted"})

        else:
            return Response("access denied", status=status.HTTP_401_UNAUTHORIZED)

    @action(methods=["get"], detail=True, url_path="doctor-name")
    def get_doctor_name(self, request, pk=None, *args, **kwargs):

        doctor = get_object_or_404(QMUser, pk=pk)

        return Response(doctor.first_name + ' ' + doctor.last_name)

       # Tags Mechanism
    @action(methods=["get"], detail=False, url_path="get-tags")
    def get_tags(self, request, pk=None, *args, **kwargs):

        def getTags():

            tags = DoctorTag.objects.all()
            tags_data = TagSerializer(tags, many=True).data

            return {"tags": tags_data}

        data = getTags()

        return Response(data, status=status.HTTP_200_OK)

       # Tags Mechanism

    @action(methods=["post"], detail=False, url_path="filter-doctors")
    def filterDoctors(self, request, pk=None, *args, **kwargs):

        data = request.data
        tags = data.get("tags", [])
        tags_list = []

        for tag in tags:
            try:
                tag_id = tag.get("id")
                tag_obj = DoctorTag.objects.get(id=tag_id)
                tags_list.append(tag_obj)
            except Exception as e:
                print(e)

        doctors = set()
        for tag_obj in tags_list:
            tag_doctors = tag_obj.doctors.all()
            tag_doctors = [
                doctor_profile.user for doctor_profile in tag_doctors]

            doctors = set(doctors) | set(tag_doctors)

        resp_data = UserSerializerReadOnly(list(doctors), many=True).data

        return Response({"data": resp_data}, status=status.HTTP_200_OK)

    # AppoitmentMechanism
    @action(methods=["get"], detail=True, url_path="get-timeslots-daywise")
    def getTimeslotsDaywise(self, request, pk=None, *args, **kwargs):
        user = get_object_or_404(QMUser, pk=pk)
        day = request.GET.get("day", None)

        if(day == None or day == ""):

            return Response({"msg": "No Day Selected"}, status=status.HTTP_400_BAD_REQUEST)

        timeslots = TimeSlot.objects.filter(doctor=user, day=day.lower())

        timeslosts_data = TimeSlotSerializer(timeslots, many=True).data

        return Response({"timeslots": timeslosts_data}, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=True, url_path="get-timeslots-datewise")
    def getTimeslotsDatewise(self, request, pk):

        user = get_object_or_404(QMUser, pk=pk)
        date = request.GET.get("date", None)

        if(date == None):
            doctor_dates = DateTimeSlot.objects.filter(
                doctor=user).order_by("date")

            dates = list([str(date[0])
                          for date in doctor_dates.values_list("date")])

            uniqueDates = []

            for date in dates:
                if(date in uniqueDates):
                    continue
                uniqueDates.append(date)

            """
                If Date is not provided it will return just unique dates...
                Those dates are the key to timeslots
            """

            return Response({"dates": uniqueDates}, status=status.HTTP_200_OK)

        else:
            timeslots = DateTimeSlot.objects.filter(
                date=date, doctor=user).order_by("start_time")

            datetimeslots = DateTimeSlotSerializer(
                timeslots, many=True).data

            return Response({"timeslots": datetimeslots}, status=status.HTTP_200_OK)


class DoctorsMViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsDoctor]
    serializer_class = UsersSerializer

    def get_queryset(self):
        customer_role = Roles.objects.filter(alias=CUSTOMERS_USER_TYPE)[0]
        queryset = QMUser.objects.filter(profile__role_id=customer_role.id)
        return queryset

    @action(methods=["get"], detail=True, url_path="get-customer-detail")
    def get_customer_details(self, request, pk=None, *args, **kwargs):
        """
        Gives you the customer details :-- 
        by pk  : user_id
        Rules : 
          Doctor has access to his details... (AccessRequest Model)
        """
        customer = QMUser.objects.get(pk=pk)
        currentDoctor = request.user

        access_request = AccessRequest.objects.filter(
            requested_by=currentDoctor, requested_for=customer)

        if(access_request.exists()):

            access_request = access_request.first()
            patientData = {}

            if(access_request.status == "has_access"):
                patientData = UsersSerializer(access_request.requested_for, context={
                    "request": request}).data

            return Response({'status': access_request.status, 'patientData': patientData, 'data': patientData})
        else:
            return Response({'status': "no access"})

    @action(methods=["get"], detail=True, url_path="get-customer-info")
    def get_customer_info(self, request, pk=None, *args, **kwargs):
        customer = QMUser.objects.get(pk=pk)
        return Response({"full_name": customer.first_name+" "+customer.last_name, "mobile": customer.profile.mobile})

    @action(methods=["post"], detail=True, url_path="send-accessrequest")
    def send_accessrequest(self, request, pk=None, *args, **kwargs):
        try:
            customer = QMUser.objects.get(pk=pk)

            AccessRequest.objects.filter(
                requested_by=request.user, requested_for=customer).delete()

            AccessRequest.objects.get_or_create(
                requested_by=request.user, requested_for=customer)

            mobile_no = customer.profile.mobile
            otp = random.randrange(1, 10**6)
            OtpRequests.objects.filter(phone_number=mobile_no).delete()

            otp_request = OtpRequests.objects.create(
                otp=otp, phone_number=mobile_no)

            send_message(mobile_no, f"Hello your One Time Password is {otp}")

            print("Your otp is .... "+str(otp))

            return Response({'status': "pending"})
        except Exception as e:
            return Response({"e": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

    @action(methods=["post"], detail=False, url_path="create-invoice")
    def create_invoice(self, request, *args, **kwargs):
        data = request.data
        formatDate = "%Y-%m-%d"
        appointmentDateStr = data.get('appointmentDate', None)

        try:
            date = appointmentDateStr.split("T")[0]
            appointmentDate = datetime.datetime.strptime(
                date, formatDate)

        except Exception as e:
            appointmentDate = None

        consultationCharges = data.get('consultationCharges', None)
        customer_id = data.get("customer", None)

        if(appointmentDate == None or consultationCharges == None or customer_id == None):
            return Response({"msg": "Please fill  all the fields correctly."}, status=status.HTTP_400_BAD_REQUEST)

        customer = QMUser.objects.get(pk=customer_id)
        doctor = request.user
        # To Select
        latest_presc = Prescription.objects.filter(
            customer=customer, created_by=doctor).last()

        if(latest_presc == None):
            return Response({"msg": "Prescription Not Created Yet...", "status": "error"}, status=status.HTTP_404_NOT_FOUND)

        already_exists = BillingInvoice.objects.filter(
            prescription=latest_presc).exists()

        if(already_exists):

            # Development Line
            BillingInvoice.objects.filter(
                prescription=latest_presc).delete()

            # return Response({"msg": "Already Created", "status": "error"}, status=status.HTTP_400_BAD_REQUEST)

        if True:
            billing_invoice = BillingInvoice(prescription=latest_presc,
                                             consulation_charges=consultationCharges,
                                             appointment_date=appointmentDate,
                                             customer=customer,
                                             created_by=doctor)

            billing_invoice.save()

            invoice_data = BillingInvoiceSerializer(
                billing_invoice, many=False).data

            return Response({"msg": "Invoice Created", "data": invoice_data}, status=status.HTTP_201_CREATED)

    # Tags Mechanism
    @action(methods=["post", "get"], detail=False, url_path="doctor_tags")
    def doctor_tags(self, request, pk=None, *args, **kwargs):

        def getTags():
            tags = request.user.profile.tags.all()
            tags_data = TagSerializer(tags, many=True).data

            remaining_tags = [

            ]
            for doctor_tag in DoctorTag.objects.all():
                if(doctor_tag in tags):
                    continue

                tag_data = {
                    'id': doctor_tag.id,
                    'tag': doctor_tag.tag
                }

                remaining_tags.append(tag_data)

            return {"tags": tags_data, "remaining_tags": remaining_tags}

        if(request.method == 'GET'):
            data = getTags()
            return Response({"msg": "Got it", "data": data}, status=status.HTTP_200_OK)

        if(request.method == 'POST'):
            tags = request.user.profile.tags.all()
            data = request.data
            tag_id = data.get("tag_id", None)
            remove = data.get("remove", False)

            if(tag_id == None):
                return Response({'msg': "No ID Provided"}, status=status.HTTP_400_BAD_REQUEST)

            tag = get_object_or_404(DoctorTag, id=tag_id)

            if(remove):
                if(not (tag in tags)):
                    return Response({'msg': "Doesn't Exists Provided"}, status=status.HTTP_400_BAD_REQUEST)

                request.user.profile.tags.remove(tag)
            else:
                if(tag in tags):
                    return Response({'msg': "Already Exists Provided"}, status=status.HTTP_400_BAD_REQUEST)

                request.user.profile.tags.add(tag)

            data = getTags()

            return Response({"data": data}, status=status.HTTP_200_OK)

        return Response({''})

    @action(methods=["post"], detail=True, url_path="verify-otp")
    def verify_otp(self, request, pk=None, *args, **kwargs):

        customer = QMUser.objects.get(pk=pk)
        mobile_no = customer.profile.mobile
        user_otp = request.data.get("otp", 2)

        access_request = AccessRequest.objects.filter(
            requested_by=request.user, requested_for=customer).first()

        if(access_request):

            access_request.status = "has_access"
            access_request.save()

            otp_exists = OtpRequests.objects.filter(
                phone_number=mobile_no, otp=user_otp).exists()

            if(otp_exists):

                return Response({"status": "has_access", "verified": True})

            else:
                return Response({"status": "invalid"}, status=status.HTTP_401_UNAUTHORIZED)

        else:
            return Response({"status": "not_found"}, status=status.HTTP_404_NOT_FOUND)


class AppointmentViewset(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsDoctor]
    serializer_class = AppoitmentSerializer
    queryset = AppointmentModel.objects.all()

    @action(methods=['POST', 'GET'], detail=False, url_path="daytimeslots")
    def daytimeslots(self, request):

        if(request.method == 'GET'):
            # gettimesots
            day = request.GET.get("day", None)

            if(day == None):
                return Response({"msg": "No days selected"}, status=status.HTTP_400_BAD_REQUEST)

            timeslots = TimeSlot.objects.filter(
                day=day.lower(), doctor=request.user)
            timeslotsData = TimeSlotSerializer(timeslots, many=True).data

            return Response({"timeslots": timeslotsData}, status=status.HTTP_200_OK)

        # create daytimeslots
        if(request.method == 'POST'):
            # {
            #     days:['Sunday','Monday'],
            #     timeslots:[{'start_time','end_time'}]

            # }

            data = request.data
            days = data.get("days", None)
            timeslots = data.get("timeslots", None)
            deletePrev = data.get("deletePrev", False)

            if(days == None or timeslots == None):
                return Response({'msg': 'No Days or Timeslots Selected'}, status=status.HTTP_400_BAD_REQUEST)

            daysAddedCount = 0
            deleted = 0
            for day in days:
                day = day.lower()
                dayAdded = False
                timeslotCounter = 0

                # Deleting Previous Fields
                if(deletePrev):
                    prevTimeslots = TimeSlot.objects.filter(
                        day=day, doctor=request.user)
                    deleted += prevTimeslots.count()
                    prevTimeslots.delete()

                for timeslot in timeslots:
                    start_time = timeslot.get("startTime", None)
                    end_time = timeslot.get("endTime", None)
                    valid_days = [day.lower() for day in [
                        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Friday']]

                    if(start_time == None or end_time == None):
                        continue

                    if(not(day in valid_days)):
                        continue

                    timeslot = TimeSlot(
                        day=day.lower(), start_time=start_time, end_time=end_time, doctor=request.user)
                    timeslot.save()

                    dayAdded = True
                    timeslotCounter += 1

                if(dayAdded == True):
                    daysAddedCount += 1

            return Response({'msg': f"{timeslotCounter} TimeSlots Added for {daysAddedCount} days. Deleted {deleted} Timeslots"}, status=status.HTTP_200_OK)

    @action(methods=['POST', 'GET'], detail=False, url_path="datetimeslots")
    def datetimeslots(self, request):

        if(request.method == 'GET'):
            date = request.GET.get("date", None)

            if(date == None):
                doctor_dates = DateTimeSlot.objects.filter(
                    doctor=request.user).order_by("date")

                dates = list([str(date[0])
                             for date in doctor_dates.values_list("date")])

                uniqueDates = []

                for date in dates:
                    if(date in uniqueDates):
                        continue
                    uniqueDates.append(date)

                """
                    If Date is not provided it will return just unique dates...
                    Those dates are the key to timeslots
                """

                return Response({"dates": uniqueDates}, status=status.HTTP_200_OK)

            else:

                """Return Timeslot by Date[Specific] 
                   Date is the key ....
                    date--input
                    timeslots--output
                """
                timeslots = DateTimeSlot.objects.filter(
                    date=date, doctor=request.user).order_by("start_time")
                datetimeslots = DateTimeSlotSerializer(
                    timeslots, many=True).data

                return Response({"timeslots": datetimeslots}, status=status.HTTP_200_OK)

        # create daytimeslots
        if(request.method == 'POST'):
            # {
            #     days:['Sunday','Monday'],
            #     timeslots:[{'start_time','end_time'}]

            # }

            data = request.data
            timeslots = data.get("timeslots", None)
            deletePrev = data.get("deletePrev", False)
            timespan = data.get("timespan", None)

            if(timespan == None or timeslots == None):
                return Response({'msg': 'No Days or Timeslots Selected'}, status=status.HTTP_400_BAD_REQUEST)

            fromDate = timespan.get("fromDate", None)
            toDate = timespan.get("toDate", None)

            if(fromDate == None or toDate == None):
                return Response({'msg': 'No Days or Timeslots Selected'}, status=status.HTTP_400_BAD_REQUEST)

            formatDate = "%Y-%m-%d"
            fromDateObj = datetime.datetime.strptime(fromDate, formatDate)
            toDateObj = datetime.datetime.strptime(toDate, formatDate)

            deltaDays = (toDateObj-fromDateObj).days
            if(fromDateObj > toDateObj or datetime.datetime.today() > fromDateObj):
                return Response({'msg': 'Invalid Timespan'}, status=status.HTTP_400_BAD_REQUEST)

            else:
                if(deltaDays > 30):
                    return Response({'msg': 'Can"t select more than 30 days '}, status=status.HTTP_400_BAD_REQUEST)

                deltaDays = (toDateObj - datetime.datetime.today()).days
                if(deltaDays > 30):
                    return Response({'msg': 'Invalid Timespan'}, status=status.HTTP_400_BAD_REQUEST)

            timespanDates = []
            for i in range(0, abs(deltaDays)+1):
                nextDate = fromDateObj+datetime.timedelta(days=i)
                timespanDates.append(nextDate)

            daysAddedCount = 0
            deleted = 0

            for date in timespanDates:
                dayAdded = False
                timeslotCounter = 0

                # Deleting Previous Fields
                if(deletePrev):
                    prevTimeslots = DateTimeSlot.objects.filter(
                        date=date, doctor=request.user)
                    deleted += prevTimeslots.count()
                    prevTimeslots.delete()

                for timeslot in timeslots:
                    start_time = timeslot.get("startTime", None)
                    end_time = timeslot.get("endTime", None)

                    if(start_time == None or end_time == None):
                        continue

                    timeslot = DateTimeSlot(
                        date=date, start_time=start_time, end_time=end_time, doctor=request.user)

                    timeslot.save()

                    dayAdded = True
                    timeslotCounter += 1

                if(dayAdded == True):
                    daysAddedCount += 1

            return Response({'msg': f"{timeslotCounter} TimeSlots Added for {daysAddedCount} dates. Deleted {deleted} Timeslots"}, status=status.HTTP_200_OK)


class PasswordReset(APIView):
    """ Generates password reset token and reset link """
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        data = request.data

        """ Checking is user exists for the provided username """
        if not QMUser.objects.filter(username=data['username']).exists():
            raise CustomValidationErr("Username doesn't exists.")

        user = QMUser.objects.get(username=data['username'])

        """ Verifying users email """
        if user.email != data['email']:
            email = user.email

            last = len(user.email) - 1
            at_sign_position = email.index('@')
            dot_position = email.index('.')

            email_hint = '%s%s%s%s%s' % (
                email[0:2],
                '*' * len(email[2:at_sign_position]),
                email[at_sign_position:(at_sign_position + 2)],
                '*' * (dot_position - (at_sign_position + 2)),
                email[dot_position:(last + 1)]
            )
            raise CustomValidationErr(
                "Email couldn't match with username. Hint: %s" % email_hint)

        """ Generating token for password reset link """
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

        payload = jwt_payload_handler(user)
        """ Setting expiration time """
        payload['exp'] = datetime.datetime.now() + datetime.timedelta(days=30)
        token = jwt_encode_handler(payload)

        """ Storing token for future reference """
        session = PasswordResetTokens.objects.create(user=user, token=token)
        session.save()

        Mailer.send_mail(
            subject='MyMedBook: Password reset link',
            recipients=[user.email],
            template_name='password_resetting.html',
            template_data={
                'user': user.__dict__,
                'reset_link': '%s?tk=%s' % (data['base_path'], token)
            }
        )

        return Response({'msg': "Reset link sent successfully", 'email': user.email})


class PasswordResetVerify(APIView):
    """ Verifies password reset token """
    permission_classes = (permissions.AllowAny,)
    serializer_class = VerifyJSONWebTokenSerializer

    def post(self, request, *args, **kwargs):
        data = request.data
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            if PasswordResetTokens.objects.filter(token=data['token']).exists():
                return Response(data['token'])
            else:
                raise CustomValidationErr(
                    'It seems that link has been used already.')

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirm(APIView):
    """ Changes user password """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        user = request.user
        data = request.data

        """ Updating password """
        user.set_password(data['password'])
        user.save()
        """ Removing token from password reset session after changing password """
        session = PasswordResetTokens.objects.filter(user=user)
        session.delete()

        Mailer.send_mail(
            subject='REDINGTON: Password changed',
            recipients=[user.email],
            template_name='password_changed.html',
            template_data={
                'user': user.__dict__
            }
        )

        serializer = UsersSerializer(user, context={'request': request})
        return Response(serializer.data)


api_password_reset = PasswordReset.as_view()
api_password_reset_verify = PasswordResetVerify.as_view()
api_password_reset_confirm = PasswordResetConfirm.as_view()
