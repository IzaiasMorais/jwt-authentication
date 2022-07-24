type User = {
  email: string;
  permissions: string;
  roles: string[];
};

type validatePermissionsParams = {
  user: User;
  permissions?: string[];
  roles?: string[];
};

export function validatePermissions({
  user,
  permissions,
  roles,
}: validatePermissionsParams) {
  if (permissions?.length > 0) {
    const hasAllPermissions = permissions?.every((permission) => {
      return user?.permissions.includes(permission);
    });

    if (!hasAllPermissions) {
      return false;
    }

    return hasAllPermissions;
  }

  if (roles?.length > 0) {
    const hasAllRoles = roles?.every((role) => {
      return user.roles.includes(role);
    });

    if (!hasAllRoles) {
      return false;
    }

    return hasAllRoles;
  }

  return true;
}
