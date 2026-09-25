export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route not found', code: 'NOT_FOUND' })
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error)
  const status = error.status || (error.name === 'MulterError' || error instanceof SyntaxError ? 400 : error.name === 'ValidationError' ? 400 : error.code === 11000 ? 409 : 500)
  const code = error.code === 11000 ? 'DUPLICATE_RESOURCE' : error.code || (status === 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST')
  const message = error instanceof AppError || status < 500
    ? error.message
    : 'An unexpected server error occurred.'
  req.log?.error({ err: error, status, code, requestId: req.id }, 'request failed')
  res.status(status).json({ error: message || 'Request failed.', code, requestId: req.id, ...(error.details ? { details: error.details } : {}) })
}