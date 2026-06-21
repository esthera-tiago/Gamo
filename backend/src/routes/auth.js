import { Router } from 'express'
import { supabase } from '../supabase.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.post('/profile', authenticate, async (req, res) => {
  try {
    const { username } = req.body

    if (!username || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username is required' })
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: req.user.id,
        username: username.trim(),
        avatar_url: req.user.user_metadata?.avatar_url || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Username already taken' })
      }
      return res.status(500).json({ error: error.message })
    }

    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/profile', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single()

    if (error) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
