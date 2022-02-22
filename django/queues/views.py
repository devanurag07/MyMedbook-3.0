from os import stat
from django.contrib.auth.models import User
from rest_framework import permissions
from rest_framework import viewsets
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from users.serializers import UserSerializerReadOnly, UsersSerializer
from queues.serializers import QueueSerializer, PrescriptionSerializer, PrescriptionDataSerializer
from queues.models import Queue, Prescription, PrescriptionData
from common.fastsms import send_message
from users.models import QMUser, Roles, UserProfile
from generics.constants import CUSTOMERS_USER_TYPE
from generics.constants import Doctors_USER_TYPE


# Create your views here.

class PrescriptionDataViewSet(viewsets.ModelViewSet):
    serializer_class = PrescriptionDataSerializer
    permission_classes = (permissions.IsAuthenticated,)
    queryset = PrescriptionData.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            query_set = self.queryset.filter(deleted=False)
        else:
            query_set = self.queryset.filter(created_by=user, deleted=False)
        return query_set

    def list(self, request, *args, **kwargs):
        query_params = request.query_params.dict()
        offset = int(query_params.pop('offset', 0))
        end = int(query_params.pop('limit', 100))
        queryset = self.get_queryset()
        order_by = query_params.pop('order_by', None)
        status = query_params.pop('status', None)
        query_set = self.get_queryset()

        if status is not None:
            query_set = query_set.filter(status=int(status))
        if order_by is not None:
            query_set = query_set.order_by(order_by)
        total_records = query_set.count()
        query_set = query_set[offset:end]
        serializer = self.serializer_class(
            query_set, many=True, context={'request': request})
        return Response({'records': serializer.data, 'totalRecords': total_records})

    def destroy(self, request, *args, **kwargs):
        self.get_queryset().filter(id=kwargs['pk']).update(deleted=True)
        return Response(True)

    def create(self, request, *args, **kwargs):
        request.data['created_by'] = request.user.id
        super(self.__class__, self).create(request, *args, **kwargs)
        return Response(True)

    def update(self, request, *args, **kwargs):
        request.data['created_by'] = request.user.id
        super(self.__class__, self).update(request, *args, **kwargs)
        return Response(True)

    @action(methods=['get'], detail=False, url_path='get-prescriptions')
    def get_prescription(self, request, *args, **kwargs):
        qs = self.get_queryset()
        query_params = request.query_params.dict()
        search_text = query_params.pop('searchText', None)
        if search_text is not None:
            qs = qs.filter(name__icontains=search_text)
        values = qs.values('id', 'name', 'drug_to_taken')
        return Response(values)


class QueueViewSet(viewsets.ModelViewSet):
    serializer_class = QueueSerializer
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Queue.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            query_set = self.queryset.filter(deleted=False)
        else:
            query_set = self.queryset.filter(created_by=user, deleted=False)
        return query_set

    def list(self, request, *args, **kwargs):
        query_params = request.query_params.dict()
        offset = int(query_params.pop('offset', 0))
        end = int(query_params.pop('limit', 100))
        queryset = self.get_queryset()
        order_by = query_params.pop('order_by', None)
        status = query_params.pop('status', None)
        query_set = queryset
        if status is not None:
            query_set = query_set.filter(status=int(status))
        if order_by is not None:
            query_set = query_set.order_by(order_by)
        query_set = query_set.order_by('-created_at')
        total_records = query_set.count()
        query_set = query_set[offset:end]
        serializer = self.serializer_class(
            query_set, many=True, context={'request': request})
        return Response({'records': serializer.data, 'totalRecords': total_records})

    def destroy(self, request, *args, **kwargs):
        self.get_queryset().filter(id=kwargs['pk']).update(deleted=True)
        return Response(True)

    def create(self, request, *args, **kwargs):
        request.data['created_by'] = request.user.id
        if request.data['customer'] is None:
            form_data = request.data
            form_data['username'] = form_data['email']

            mobile = request.data.get("mobile", None)
            if(not mobile == None):
                mobile_exits = UserProfile.objects.filter(
                    mobile=mobile).exists()

            if(mobile_exits):
                return Response({'mobileExists': True}, status=status.HTTP_401_UNAUTHORIZED)

            from users.models import Roles, QMUser, Group
            from django.utils.crypto import get_random_string
            user = QMUser()
            user.__dict__.update(**form_data)
            user.save()
            user_role = Roles.objects.filter(alias='Customers').first()
            permission_groups = Group.objects.filter(id=user_role.id)
            password = get_random_string(length=7)
            user.set_password(password)
            user.save()
            user.groups.set(permission_groups)
            user.save()
            user_profile = UserProfile()
            user_profile.user = user
            user_profile.role_id = user_role.id
            user_profile.user_type = 'C'
            user_profile.created_by = request.user
            user_profile.mobile = form_data['mobile']
            user_profile.save()
            request.data['customer'] = user.id
            from common.fastsms import send_message
            message = 'Dear %s, a warm welcome to www.mymedbook.in. One place to manage all your health records.\n\nLogin details \n Username: %s \nPassword: %s \n\nTeam MyMedbook' \
                      % (form_data['first_name'], form_data['username'], password)
            data = send_message(form_data['mobile'], message)
        super(self.__class__, self).create(request, *args, **kwargs)
        return Response(True)

    def update(self, request, *args, **kwargs):
        import pdb
        pdb.set_trace()
        request.data['created_by'] = request.user.id
        super(self.__class__, self).update(request, *args, **kwargs)
        return Response(True)

    @action(methods=['get'], detail=False, url_path='reports')
    def queue_reports(self, request, *args, **kwargs):
        user = self.request.user

        if user.is_superuser:
            query_set = self.queryset
        else:
            query_set = self.queryset.filter(created_by=user)

        from django.db.models import Sum
        from payment.models import PaymentDetails
        payment_data = PaymentDetails.objects.aggregate(Sum('amount'))

        resp_data = {
            'total': query_set.count(),
            'pending': query_set.filter(status=0, deleted=False).count(),
            'closed': query_set.filter(status=1, deleted=False).count(),
            'deleted': query_set.filter(deleted=True).count(),
            'total_payment': payment_data['amount__sum']
        }

        if(request.user.is_superuser):

            customer_role_id = Roles.objects.filter(
                alias=CUSTOMERS_USER_TYPE).first().id
            doctor_role_id = Roles.objects.filter(
                alias=Doctors_USER_TYPE).first().id

            resp_data["total_customers"] = QMUser.objects.filter(
                profile__role_id=customer_role_id).count()
            resp_data["total_doctors"] = QMUser.objects.filter(
                profile__role_id=doctor_role_id).count()

        return Response(resp_data)

    @action(methods=['get'], detail=False, url_path='high-charts')
    def high_charts(self, request, *args, **kwargs):

        user = self.request.user
        if user.is_superuser:
            query_set = self.queryset
        else:
            query_set = self.queryset.filter(created_by=user)
        import datetime
        previous_month_data = []
        month_choices = []
        now = datetime.datetime.now()
        year = now.year
        from django.conf import settings
        settings.USE_TZ = False
        for _ in range(0, 2):
            now = now.replace(day=1) - datetime.timedelta(days=1)
            previous_month_data.append(query_set.filter(created_at__month=now.month,
                                                        created_at__year=year).count())
            month_choices.append(now.strftime("%B"))
        day_choices = []
        days_data = []
        today = datetime.datetime.now()
        for i in range(7):
            loop_now = today - datetime.timedelta(days=i)
            days_data.append(query_set.filter(created_at__month=loop_now.month,
                                              created_at__year=year,
                                              created_at__day=loop_now.day).count())
            day_choices.append(loop_now.strftime("%a"))

        settings.USE_TZ = True
        return Response({
            'previous_month_data': previous_month_data,
            'month_choices': month_choices,
            'day_choices': day_choices,
            'days_data': days_data
        })

    @action(methods=['post'], detail=False, url_path='send-message')
    def send_message(self, request, *args, **kwargs):
        form_data = request.data
        queue = Queue.objects.get(id=form_data['id'])
        customer = queue.customer
        data = send_message(customer.profile.mobile, form_data['message'])
        return Response(data)

    @action(methods=['get'], detail=True, url_path="get-queue")
    def get_queue(self, request, *args, **kwargs):
        queue_id = kwargs["pk"]
        queue = get_object_or_404(Queue, pk=queue_id)

        doctor_role = Roles.objects.filter(alias=Doctors_USER_TYPE).first()

        is_doctor = str(doctor_role.id) in str(request.user.profile.role_id)
        has_personal_access = queue.customer == request.user

        data = QueueSerializer(queue, many=False).data

        doctor_info = UserSerializerReadOnly(queue.created_by, many=False, context={
            "request": request}).data

        if(has_personal_access):
            data["doctor_info"] = doctor_info
        # if its other doctor
        elif (not(queue.created_by == request.user)):
            data["doctor_name"] = "x.x.x"

        if(request.user.is_superuser or is_doctor or has_personal_access):
            return Response(data)

        return Response("Not AUTHORIZED", status=status.HTTP_401_UNAUTHORIZED)


class PrescriptionViewSet(viewsets.ModelViewSet):
    serializer_class = PrescriptionSerializer
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Prescription.objects.all()

    def get_queryset(self):
        '''
        user = self.request.user
        if user.is_superuser:
            query_set = self.queryset.filter(deleted=False)
        else:
            query_set = self.queryset.filter(created_by=user, deleted=False)
        return query_set
        '''
        user = self.request.user
        query_set = self.queryset.filter(customer=user)
        return query_set

    def list(self, request, *args, **kwargs):
        query_params = request.query_params.dict()
        offset = int(query_params.pop('offset', 0))
        end = int(query_params.pop('limit', 100))
        queryset = self.get_queryset()
        order_by = query_params.pop('order_by', None)
        query_set = queryset
        if order_by is not None:
            query_set = query_set.order_by(order_by)
        total_records = query_set.count()
        query_set = query_set[offset:end]
        serializer = self.serializer_class(
            query_set, many=True, context={'request': request})
        return Response({'records': serializer.data, 'totalRecords': total_records})

    def destroy(self, request, *args, **kwargs):
        self.get_queryset().filter(id=kwargs['pk']).update(deleted=True)
        return Response(True)

    def create(self, request, *args, **kwargs):
        form_data = request.data

        prescriptions = request.data['prescription']
        prescriptions = prescriptions if prescriptions != None else []

        prescriptionsList = prescriptions+request.data['prescriptionsData']

        # Sorting medicine by index
        prescriptionsList = sorted(prescriptionsList, key=lambda x: x['idx'])

        prescriptionsObjs = []
        for prescription in prescriptionsList:
            exists = prescription.get("exists", True)

            if(exists):
                prescriptionId = prescription['id']
                pres_object = PrescriptionData.objects.get(id=prescriptionId)

                prescriptionsObjs.append(pres_object)

            else:

                pres_object = PrescriptionData()
                pres_object.name = prescription["medicine_name"]
                pres_object.created_by = request.user
                pres_object.note = prescription['note']
                pres_object.drug_to_taken = prescription['drug_to_taken']

                pres_object.save()
                prescriptionsObjs.append(pres_object)

        prescriptionMsg = "\n".join([
            prescription.name for prescription in prescriptionsObjs])

        message = 'Dear %s, \nHere is your prescription:\nClinic name: %s \nPrescription: %s \nNote: %s \n\n' \
            'Team MyMedbook' % (
                form_data['customer_name'], form_data['clinic_name'], prescriptionMsg, form_data['note'])
        data = send_message(str(form_data['mobile']), message)

        try:
            if data.status_code == 200:

                json_data = data.json()
                queue = Queue.objects.get(id=request.data['queue_id'])
                queue.status = 1
                queue.save()
                form_data['created_by_id'] = request.user.id
                form_data['customer_id'] = queue.customer.id
                # form_data['prescription_id'] = pres_object.id

                del form_data['prescription']

                prescription_instance = Prescription()
                prescription_instance.__dict__.update(form_data)
                prescription_instance.save()

                for pres_obj in prescriptionsObjs:
                    prescription_instance.prescription.add(pres_obj)

                prescription_instance.save()

                self.send_next_queue_message(queue, request.user)
                return Response(True)

            else:
                return Response(data, status=400)
        except Exception as e:
            return Response(data, status=400)

        return Response(data, status=400)

    def send_next_queue_message(self, queue, user):
        next_queue_list = Queue.objects.filter(
            created_by=user, status=0, id__gt=queue.id)
        if next_queue_list.count() >= 2:
            next_queue = next_queue_list[2]
            customer = next_queue.customer
            message = 'Dear %s, Only 3 patients left on the queue, you are next\n\nMyMedbook team' % customer.first_name
            data = send_message(customer.profile.mobile, message)
            return data
        return True

    def update(self, request, *args, **kwargs):
        request.data['created_by'] = request.user.id
        super(self.__class__, self).update(request, *args, **kwargs)
        return Response(True)
