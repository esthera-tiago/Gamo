import { Router } from 'express'
import { supabase } from '../supabase.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { data: levels, error } = await supabase
      .from('levels')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    let progressMap = {}

    if (req.user) {
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', req.user.id)

      if (progress) {
        for (const p of progress) {
          progressMap[p.level_id] = p
        }
      }
    }

    const result = levels.map((level, index) => {
      const prog = progressMap[level.id] || null
      let isLocked = false

      if (level.unlock_requires && (!progressMap[level.unlock_requires] || !progressMap[level.unlock_requires].completed)) {
        isLocked = true
      }

      const requiredLevel = level.unlock_requires
        ? levels.find(l => l.id === level.unlock_requires)
        : null

      return {
        ...level,
        progress: prog ? {
          completed: prog.completed,
          score: prog.score,
          accuracy: prog.accuracy,
          attempts: prog.attempts,
          last_played_at: prog.last_played_at,
        } : null,
        locked: isLocked,
        lockedBy: requiredLevel ? requiredLevel.name : null,
      }
    })

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
