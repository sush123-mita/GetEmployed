import { analyzeResume } from '../services/analysisService.js'

export async function analyzeResumeController(req, res) {
  const result = await analyzeResume({ file: req.file, sessionId: req.sessionId, logger: req.log })
  res.status(200).json(result)
}