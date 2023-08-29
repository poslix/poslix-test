export interface ICustomResponse<T> {
  status: number;
  success: boolean;
  result: T;
}
