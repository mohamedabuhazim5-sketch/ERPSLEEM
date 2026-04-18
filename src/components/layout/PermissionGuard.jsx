export default function PermissionGuard({ allowedRoles = [], profile, children, fallback = null }) {
  if (!profile) return fallback;
  if (allowedRoles.length === 0) return children;
  if (!allowedRoles.includes(profile.role)) return fallback;
  return children;
}
