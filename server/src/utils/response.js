export const successResponse = (res, data = {}, message = 'Request completed successfully', statusCode = 200) => {
  if (statusCode === 204) {
    return res.status(204).send();
  }
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const errorResponse = (res, statusCode, code, message, details = []) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
};

export class AppError extends Error {
  constructor(statusCode, code, message, details = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
