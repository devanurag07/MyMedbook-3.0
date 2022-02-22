from re import T
from generics.defaults import AppDefaults
from users.serializers import UsersSerializer


def jwt_response_payload_handler2(token, user=None, request=None):
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
