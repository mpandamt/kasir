export class CategoryResponse {
  id: number;
  name: string;
}

export type FindAllCategoryRequest = {
  name?: string;
  page: number;
  size: number;
};
