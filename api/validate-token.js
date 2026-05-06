import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token } = req.body
  const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress

  if (!token) {
    return res.status(400).json({ error: 'Token is required' })
  }

  try {
    const { data, error } = await supabase
      .from('redeem_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Invalid token' })
    }

    if (data.used) {
      return res.status(400).json({ error: 'Token already used' })
    }

    if (new Date(data.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Token expired' })
    }

    return res.status(200).json({ valid: true, token: data.token })
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}
