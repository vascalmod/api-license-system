import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check for secret key (optional security)
  const { secret, ip_address } = req.body

  // Simple security check (optional)
  if (secret !== process.env.TOKEN_GENERATION_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = crypto.randomBytes(16).toString('hex')
  const ip = ip_address || req.headers['x-forwarded-for'] || req.connection.remoteAddress

  try {
    const { data, error } = await supabase
      .from('redeem_tokens')
      .insert([{
        token,
        ip_address: ip,
        used: false,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating token:', error)
      return res.status(500).json({ error: 'Failed to create token' })
    }

    return res.status(200).json({
      success: true,
      token: data.token,
      url: `${req.headers['x-forwarded-host'] || 'https://api-license-system.vercel.app'}/redeem?token=${data.token}`,
      expires_at: data.expires_at
    })
  } catch (err) {
    console.error('Server error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
