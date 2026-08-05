export type Member = {
  id: number;
  full_name: string;
  phone: string;
  city_id: number;
  city_name: string;
  created_at: string;
  updated_at: string;
};

export type CreateMemberRequest = {
  full_name: string;
  phone: string;
  city_id: number;
};

export type UpdateMemberRequest = {
  full_name: string;
  phone: string;
  city_id: number;
};

export type MembersListParams = {
  page?: number;
  limit?: number;
  search?: string;
  city_id?: number;
};
