import express from 'express'
import { INTEREST_CATEGORIES } from '../constants/categories.js'

const router = express.Router()

router.get('/', (req, res) => {
  res.json({
    success: true,
    categories: INTEREST_CATEGORIES
  })
})

export default router
