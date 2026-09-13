export type Role = 'admin' | 'editor' | 'viewer';
export type User = { id: string; email: string; name: string; role: Role; status: 'active' | 'disabled' };
export type Permission = 'content:write' | 'content:publish' | 'content:delete' | 'users:manage' | 'settings:manage' | 'requests:manage' | 'audit:read';
const grants: Record<Role, readonly Permission[]> = {
 admin: ['content:write', 'content:publish', 'content:delete', 'users:manage', 'settings:manage', 'requests:manage', 'audit:read'],
 editor: ['content:write'], viewer: [],
};
export function can(user: User | null, permission: Permission) { return !!user && user.status === 'active' && grants[user.role].includes(permission); }
export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export function demand(user: User | null, permission?: Permission): asserts user is User {
 if (!user || user.status !== 'active') throw new HttpError(401, 'Veuillez vous connecter.');
 if (permission && !can(user, permission)) throw new HttpError(403, 'Cette action ne vous est pas autorisée.');
}
