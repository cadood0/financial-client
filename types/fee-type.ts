export type FeeType = {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateFeeTypeRequest = {
  name: string;
  description?: string;
  is_active?: boolean;
};

export type UpdateFeeTypeRequest = {
  name: string;
  description?: string;
  is_active?: boolean;
};

export type FeeTypesListParams = {
  page?: number;
  limit?: number;
  search?: string;
};
