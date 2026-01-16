export function notFound(req, res) {
  res.status(404).json({ message: "Not found" });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  // Mongoose validation
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: "Validation error", details });
  }

  // Bad ObjectId etc.
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid id" });
  }

  // Don’t leak stack traces
  const msg = err.message || "Server error";
  res.status(status).json({ message: msg });
}
