export type NodeResponse = {
  id: string;
  title: string;
  content: string;
  parentId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserResponse = {
  id: string;
  name: string;
  email: string;
  role: string;
};
