export type EstimationMethod = 'THREE_POINT' | 'SINGLE_VALUE' | 'T_SHIRT' | 'STORY_POINTS';
export type TShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL';

export interface RoleHours {
  id?: string;
  roleId: string;
  roleName: string;
  optimisticHours?: number;
  likelyHours?: number;
  pessimisticHours?: number;
  singleHours?: number;
  tshirtSize?: TShirtSize;
  storyPoints?: number;
  expectedHours: number;
  defaultHourlyCostMinor?: number;
}

export interface Feature {
  id: string;
  moduleId: string;
  name: string;
  description?: string;
  method: EstimationMethod;
  assignedUserId?: string;
  assignedUserName?: string;
  orderIndex: number;
  roleHours: RoleHours[];
}

export interface ModuleItem {
  id: string;
  projectId: string;
  parentId?: string | null;
  name: string;
  description?: string;
  orderIndex: number;
  features: Feature[];
  children?: ModuleItem[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description?: string;
  currency: string;
  isTemplate: boolean;
  templateCategory?: string;
  modules: ModuleItem[];
}

export interface RoleOption {
  id: string;
  name: string;
  defaultHourlyCostMinor?: number;
}

export interface UserOption {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'PM' | 'DEVELOPER';
}
