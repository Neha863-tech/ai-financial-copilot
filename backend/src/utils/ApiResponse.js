export class ApiResponse {
  constructor(statusCode, message, data = null, meta = null) {
    this.success = statusCode < 400;
    this.message = message;
    if (data !== null && data !== undefined) this.data = data;
    if (meta !== null && meta !== undefined) this.meta = meta;
  }

  static success(message, data, meta) {
    return new ApiResponse(200, message, data, meta);
  }

  static created(message, data) {
    return new ApiResponse(201, message, data);
  }
}
