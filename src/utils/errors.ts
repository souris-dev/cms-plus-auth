export class ServerError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

export class ResourceNotFoundError extends ServerError {
  constructor(message: string) {
    super(message, 404);
  }
}
