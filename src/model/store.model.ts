export class StoreResponse {
  id: number;
  name: string;
}

export type FindAllStoreRequest = {
  name?: string;
  page: number;
  size: number;
};
