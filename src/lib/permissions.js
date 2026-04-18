export const ROLES = {
  ADMIN: 'admin',
  CASHIER: 'cashier',
  STOREKEEPER: 'storekeeper',
  ACCOUNTANT: 'accountant',
};

export function hasRole(profile, allowedRoles = []) {
  if (!profile) return false;
  if (allowedRoles.length === 0) return true;
  return allowedRoles.includes(profile.role);
}
