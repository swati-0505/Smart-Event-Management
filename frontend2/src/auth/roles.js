export const USER_ROLE = "USER";
export const ADMIN_ROLES = Object.freeze(["ADMIN", "MAIN_ADMIN"]);
export const MAIN_ADMIN_ROLE = "MAIN_ADMIN";

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(role);
}
