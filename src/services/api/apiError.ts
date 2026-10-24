export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, detail: unknown) {
    super(`Request failed with status ${status}.`);
    this.status = status;
    this.detail = detail;
  }
}
