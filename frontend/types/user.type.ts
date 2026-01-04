enum LoginType {
  USER,
  FAMILY_MEMBER,
}
//From DB
export type userInfo = {
  id: string;
  email: string;
  phoneNumber?: string;
  name: string;
  imageUrl: string;
  role: LoginType;
  createdAt: string;
  updatedAt: string;
};
//Form Or User Input
export type UserData = {
  name: string;
  phoneNumber?: string;
  profilePic?: File | null;
  password?: string;
  newPassword?: string;
};
