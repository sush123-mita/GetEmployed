import crypto from 'node:crypto'

export function sessionMiddleware(req, res, next) {
  let sessionId = req.signedCookies.ge_session
  if (!sessionId || !/^[a-f0-9]{32}$/.test(sessionId)) {
    sessionId = crypto.randomBytes(16).toString('hex')
    res.cookie('ge_session', sessionId, {
      signed: true,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 365,
    })
  }
  req.sessionId = sessionId
  next()
}