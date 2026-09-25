import { Router } from 'express'
import multer from 'multer'
import { AppError } from '../errors.js'
import { analyzeResumeController } from '../controllers/analysisController.js'

const upload = multer({
  storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    const accepted = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    callback(accepted.includes(file.mimetype) ? null : new AppError(400, 'INVALID_FILE_TYPE', 'Only PDF and DOCX resumes are accepted.'), accepted.includes(file.mimetype))
  },
})

export const resumeRouter = Router()
resumeRouter.post('/analyze', upload.single('resume'), (req, res, next) => {
  if (!req.file) return next(new AppError(400, 'RESUME_REQUIRED', 'Upload a PDF or DOCX resume.'))
  return analyzeResumeController(req, res).catch(next)
})