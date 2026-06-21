import { Router } from 'express'
import { supabase } from '../supabase.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', req.user.id)
      .order('last_played_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/', authenticate, async (req, res) => {
  try {
    const { level_id, completed, score, accuracy, time_seconds } = req.body

    if (!level_id) {
      return res.status(400).json({ error: 'level_id is required' })
    }

    const { data: existing } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('level_id', level_id)
      .single()

    const updateData = {
      user_id: req.user.id,
      level_id,
      completed: completed || false,
      accuracy: accuracy || null,
      time_seconds: time_seconds || null,
      last_played_at: new Date().toISOString(),
      attempts: existing ? existing.attempts + 1 : 1,
    }

    if (existing) {
      updateData.score = score > existing.score ? score : existing.score
    } else {
      updateData.score = score || 0
    }

    const { data, error } = await supabase
      .from('user_progress')
      .upsert(updateData, { onConflict: 'user_id, level_id' })
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
