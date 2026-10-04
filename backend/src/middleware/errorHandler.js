import { HttpError } from "../errors/httpError.js";

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const expose = err instanceof HttpError || err.expose === true;
  const status = expose ? err.status : 500;
  const message = expose ? err.message : "Internal Server Error";

  if (status >= 500) {
    console.error("[Error]", {
      path: req.path,
      method: req.method,
      status,
      message: err.message,
      cause: err.cause?.message,
      stack: err.stack,
    });
  }

  if (expose && err.headers) res.set(err.headers);

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
