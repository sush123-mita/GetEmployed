import { z } from 'zod'

const stringList = z.array(z.string().trim().min(1).max(300)).max(100).default([])

export const jobInputSchema = z.object({
  title: z.string().trim().min(1).max(300), company: z.string().trim().min(1).max(300), location: z.string().trim().max(300).default(''),
  url: z.string().url().refine(value => ['http:', 'https:'].includes(new URL(value).protocol), 'URL must use HTTP or HTTPS'),
  source: z.string().trim().min(1).max(100), matchScore: z.number().min(0).max(100).optional(), matchedSkills: stringList,
  missingSkills: stringList, workMode: z.string().trim().max(50).optional(), employmentType: z.string().trim().max(80).optional(),
  description: z.string().max(20000).default(''), requirements: stringList, responsibilities: stringList, matchExplanation: z.string().max(2000).optional(),
  matchReasons: stringList, postedDate: z.coerce.date().optional(), salary: z.string().trim().max(200).optional(),
}).strict()

export const statusSchema = z.object({
  status: z.enum(['saved', 'applied', 'interviewing', 'offer', 'archived']),
  notes: z.string().max(2000).optional().default(''),
}).strict()