import { Router } from 'express'
import { supabase } from '../supabase.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/leaderboard/:level_id', async (req, res) => {
  try {
    const { level_id } = req.params

    const { data, error } = await supabase
      .from('scores')
      .select(`
        id,
        score,
        accuracy,
        time_seconds,
        played_at,
        user_id,
        profiles!inner(username, avatar_url)
      `)
      .eq('level_id', level_id)
      .order('score', { ascending: false })
      .limit(10)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const result = data.map(entry => ({
      id: entry.id,
      score: entry.score,
      accuracy: entry.accuracy,
      time_seconds: entry.time_seconds,
      played_at: entry.played_at,
      username: entry.profiles.username,
      avatar_url: entry.profiles.avatar_url,
    }))

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/', authenticate, async (req, res) => {
  try {
    const { level_id, score, accuracy, time_seconds } = req.body

    if (!level_id || score === undefined) {
      return res.status(400).json({ error: 'level_id and score are required' })
    }

    const { data, error } = await supabase
      .from('scores')
      .insert({
        user_id: req.user.id,
        level_id,
        score,
        accuracy,
        time_seconds,
      })
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
