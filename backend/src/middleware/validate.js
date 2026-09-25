import { AppError } from '../errors.js'

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      next(new AppError(400, 'VALIDATION_ERROR', 'Request validation failed.', result.error.flatten()))
      return
    }
    req[source] = result.data
    next()
  }
}