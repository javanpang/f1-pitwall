export class HttpError extends Error {
  constructor(status, message, { cause, headers } = {}) {
    super(message, { cause });
    this.name = "HttpError";
    this.status = status;
    this.headers = headers;
  }
}
