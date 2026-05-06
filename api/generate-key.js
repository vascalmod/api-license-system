import { createClient } from '@supabase/supabase-js'
const crypto = require('crypto')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Rate limiting store (in-memory, use Redis for production)
const rateLimitStore = new Map()

function checkRateLimit(ip) {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 3

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, [])
  }

  const requests = rateLimitStore.get(ip).filter(t => now - t < windowMs)
  
  if (requests.length >= maxRequests) {
    return false
  }

  requests.push(now)
  rateLimitStore.set(ip, requests)
  return true
}

function generateApiKey() {
  return 'ak_' + crypto.randomBytes(32).toString('hex')
}

async function verifyHCaptcha(token, ip) {
  if (!token) return false
  
  // Skip verification if no secret configured (dev mode)
  if (!process.env.HCAPTCHA_SECRET) {
    console.log('HCAPTCHA_SECRET not set, skipping verification')
    return true
  }
  
  try {
    const res = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET,
        response: token,
        remoteip: ip
      })
    })
    const data = await res.json()
    console.log('hCaptcha verification result:', data)
    return data.success === true
  } catch (err) {
    console.error('hCaptcha verification error:', err)
    return false
  }
}

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { token, captcha_token } = req.body
    const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress

    console.log('Received request:', { token, ip_address, hasCaptchaToken: !!captcha_token })

    if (!token || !captcha_token) {
      return res.status(400).json({ error: 'Token and CAPTCHA verification required' })
    }

    // Verify hCaptcha
    const captchaValid = await verifyHCaptcha(captcha_token, ip_address)
    if (!captchaValid) {
      return res.status(400).json({ error: 'CAPTCHA verification failed' })
    }

    // Rate limiting
    if (!checkRateLimit(ip_address)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' })
    }

    // Check environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing environment variables')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    // Validate token
    console.log('Validating token:', token)
    const { data: tokenData, error: tokenError } = await supabase
      .from('redeem_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (tokenError || !tokenData) {
      console.error('Token lookup error:', tokenError)
      return res.status(404).json({ error: 'Invalid token' })
    }

    if (tokenData.used) {
      return res.status(400).json({ error: 'Token already used' })
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Token expired' })
    }

    // Check if IP already has active key
    console.log('Checking existing license for IP:', ip_address)
    const { data: existingLicense } = await supabase
      .from('licenses')
      .select('*')
      .eq('ip_address', ip_address)
      .eq('status', 'active')
      .single()

    if (existingLicense) {
      return res.status(400).json({ error: 'Active license already exists for this IP' })
    }

    // Generate API key
    const newKey = generateApiKey()
    const expires_at = new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours

    // Store license
    console.log('Creating license:', { key: newKey, ip_address })
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .insert([{
        key: newKey,
        token,
        ip_address,
        expires_at,
        status: 'active'
      }])
      .select()
      .single()

    if (licenseError) {
      console.error('License creation error:', licenseError)
      return res.status(500).json({ error: 'Failed to create license: ' + licenseError.message })
    }

    // Mark token as used
    console.log('Marking token as used:', token)
    await supabase
      .from('redeem_tokens')
      .update({ used: true })
      .eq('token', token)

    console.log('License created successfully:', newKey)
    return res.status(200).json({
      success: true,
      api_key: newKey,
      expires_at,
      expires_in_hours: 8
    })
  } catch (err) {
    console.error('Server error:', err)
    return res.status(500).json({ error: 'Internal server error: ' + err.message })
  }
}
