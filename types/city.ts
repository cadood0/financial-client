export type City = {
  id: number;
  name: string;
  region: string;
  created_at: string;
  updated_at: string;
};

export type CreateCityRequest = {
  name: string;
  region: string;
};

export type UpdateCityRequest = {
  name: string;
  region: string;
};

export type CitiesListParams = {
  page?: number;
  limit?: number;
  search?: string;
};
