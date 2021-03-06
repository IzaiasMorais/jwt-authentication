import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { validatePermissions } from "../utils/ValidatePermissions";

type UseCanParams = {
  permissions?: string[];
  roles?: string[];
};

export function useCan({ permissions, roles }: UseCanParams) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return false;
  }

  const userHasValidPermissions = validatePermissions({
    user,
    permissions,
    roles,
  });

  return userHasValidPermissions;
}
