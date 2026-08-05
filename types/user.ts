export type {
  User,
  LoginRequest,
  LoginResponse,
  AuthErrorResponse,
} from "@/types/auth";

export type RegisterUserRequest = {
  name: string;
  email: string;
  password: string;
};

export type UpdateUserRequest = {
  name: string;
  email: string;
};

export type UsersListParams = {
  page?: number;
  limit?: number;
  search?: string;
};
