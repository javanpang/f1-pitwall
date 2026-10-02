/**
 * Global error handler middleware
 */
export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (status >= 500) {
    console.error("[Error]", {
      path: req.path,
      method: req.method,
      status,
      message,
      stack: err.stack,
    });
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
