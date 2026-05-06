import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { api_key } = req.query

  if (!api_key) {
    return res.status(400).json({ error: 'API key is required' })
  }

  try {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('key', api_key)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Invalid API key' })
    }

    // Auto-update expired status
    if (data.status === 'active' && new Date(data.expires_at) < new Date()) {
      await supabase
        .from('licenses')
        .update({ status: 'expired' })
        .eq('api_key', api_key)
      
      data.status = 'expired'
    }

    const now = new Date()
    const expires_at = new Date(data.expires_at)
    const time_left_ms = expires_at - now
    const time_left_hours = Math.max(0, time_left_ms / (1000 * 60 * 60))

    return res.status(200).json({
      valid: data.status === 'active',
      status: data.status,
      created_at: data.created_at,
      expires_at: data.expires_at,
      time_left_hours: parseFloat(time_left_hours.toFixed(2)),
      request_count: data.request_count
    })
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}
