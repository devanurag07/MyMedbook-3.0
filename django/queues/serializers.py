from queues.models import Queue, Prescription, PrescriptionData
from rest_framework import serializers


class PrescriptionDataSerializer(serializers.ModelSerializer):
    note = serializers.CharField(allow_null=True, allow_blank=True)

    class Meta:
        model = PrescriptionData
        fields = (
            'id', 'name', 'drug_to_taken', 'note',
            'deleted', 'created_by', 'created_at')
        read_only_fields = ['deleted', 'status']


class QueueSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source='customer.first_name')
    email = serializers.ReadOnlyField(source='customer.email')
    address = serializers.ReadOnlyField(source='customer.address_line1')
    mobile = serializers.ReadOnlyField(source='customer.profile.mobile')
    purpose_of_visit = serializers.ReadOnlyField(
        source='prescription_queue.purpose_of_visit')
    note = serializers.CharField(allow_null=True, allow_blank=True)
    prescription_id = serializers.SerializerMethodField()

    def get_prescription_id(self, obj):
        try:
            return obj.queue_prescription.id
        except:
            return 0

    class Meta:
        model = Queue
        fields = (
            'id', 'customer', 'customer_name', 'email', 'mobile', 'address', 'note', 'status',
            'deleted', 'created_by', 'created_at', 'purpose_of_visit', 'prescription_id')
        read_only_fields = ['deleted', 'status']


class PrescriptionSerializer(serializers.ModelSerializer):
    note = serializers.CharField(allow_null=True, allow_blank=True)
    prescription_name = serializers.ReadOnlyField(source='prescription.name')
    prescription_drug_to_taken = serializers.ReadOnlyField(
        source='prescription.drug_to_taken')

    doctor_name = serializers.SerializerMethodField()

    prescription_list = serializers.SerializerMethodField()

    def get_prescription_list(self, obj):
        queryset = obj.prescription.all()
        return PrescriptionDataSerializer(queryset, many=True).data

    def get_doctor_name(self, obj):
        return obj.created_by.first_name

    class Meta:
        model = Prescription
        fields = (
            'id', 'customer', 'customer_name', 'clinic_name', 'queue', 'mobile', 'prescription',
            'note', 'prescription_name', 'prescription_drug_to_taken', 'deleted', 'created_by',
            'created_at', 'prescription_list',
            'purpose_of_visit', 'symptoms', 'doctor_name')
        read_only_fields = ['deleted']
