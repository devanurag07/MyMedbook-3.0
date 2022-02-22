from rest_framework.permissions import BasePermission
from users.models import Roles


class IsDoctor(BasePermission):
    def has_object_permission(self, request, view, obj):
        if(request.is_authenticated):
            doctor_roleid = Roles.objects.get(alias="Doctor").id
            user_roleid = request.user.profile.role_id
            if(user_roleid == doctor_roleid):
                return True
            return False

        return False

        return super().has_object_permission(request, view, obj)
