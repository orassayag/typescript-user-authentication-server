export interface RoleUserDoc {
  _id: string;
  userId: number;
  appId: string;
  roleId: string;
  isActive: boolean;
}