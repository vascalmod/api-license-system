import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import HCaptcha from '@hcaptcha/react-hcaptcha'

function RedeemPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const captchaRef = useRef(null)
  
  const [tokenValid, setTokenValid] = useState(null)
  const [captchaToken, setCaptchaToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(10)
  const [canGenerate, setCanGenerate] = useState(false)

  useEffect(() => {
    // Local testing mode - allow access without token in development
    if (!token) {
      if (import.meta.env.DEV) {
        // In development, create a mock valid state for testing
        setTokenValid(true)
        // Set a mock token for testing
        if (!window.__DEV_TOKEN__) {
          window.__DEV_TOKEN__ = 'dev_test_token_' + Math.random().toString(36).substr(2, 9)
        }
        return
      }
      setError('No token provided. Please use a valid link with ?token=xxx')
      return
    }

    // Validate token
    fetch('/api/validate-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setTokenValid(true)
        } else {
          setTokenValid(false)
          setError(data.error || 'Invalid token')
        }
      })
      .catch((err) => {
        setTokenValid(false)
        setError('Failed to validate token: ' + (err.message || 'Server error'))
        console.error('Token validation error:', err)
      })
  }, [token])

  // Countdown timer for delayed button
  useEffect(() => {
    if (tokenValid && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      setCanGenerate(true)
    }
  }, [tokenValid, countdown])

  const handleCaptchaVerify = (token) => {
    setCaptchaToken(token)
  }

  const handleCaptchaExpire = () => {
    setCaptchaToken(null)
  }

  const handleGenerateKey = async () => {
    if (!captchaToken) {
      setError('Please complete CAPTCHA verification')
      return
    }

    setLoading(true)
    setError('')

    // Use dev token in development mode
    const tokenToUse = token || (import.meta.env.DEV ? window.__DEV_TOKEN__ : null)
    
    if (!tokenToUse) {
      setError('No token available')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/generate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: tokenToUse, 
          captcha_token: captchaToken,
          captcha_verified: true 
        })
      })

      const data = await response.json()

      if (data.success) {
        navigate('/result', { state: { api_key: data.api_key, expires_at: data.expires_at } })
      } else {
        setError(data.error || 'Failed to generate key')
      }
    } catch (err) {
      setError('Failed to generate API key')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Banner Ad */}
      <div className="w-full bg-gray-800 p-2 text-center text-sm text-gray-400">
        <span className="text-xs">Advertisement</span>
        {/* PopAds Top Banner - Replace with actual PopAds code */}
        <div className="h-16 bg-gray-700 flex items-center justify-center">
          PopAds Top Banner (728x90)
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
          <h1 className="text-3xl font-bold mb-6 text-center">API License Generator</h1>

          {!token && (
            <div className="bg-red-600 p-4 rounded mb-4">
              Invalid access. Please use a valid Linkvertise link.
            </div>
          )}

          {tokenValid === false && (
            <div className="bg-red-600 p-4 rounded mb-4">
              {error || 'Invalid or expired token'}
            </div>
          )}

          {tokenValid && (
            <>
              {/* Mid-Content Ad */}
              <div className="mb-6 p-3 bg-gray-700 rounded text-center text-sm text-gray-400">
                <span className="text-xs">Advertisement</span>
                <div className="h-32 bg-gray-600 flex items-center justify-center mt-2">
                  PopAds Mid-Content (300x250)
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-300 mb-2">Token Status: <span className="text-green-400">Valid</span></p>
                
                <div className="mb-4">
                <HCaptcha
                  ref={captchaRef}
                  sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY || '8a921660-b2f6-4556-a83c-0db2fde4cf30'}
                  onVerify={handleCaptchaVerify}
                  onExpire={handleCaptchaExpire}
                />
                {captchaToken && (
                  <p className="text-green-400 text-sm mt-2">✓ CAPTCHA Verified</p>
                )}
              </div>

                {!canGenerate && (
                  <p className="text-gray-400 text-center mb-4">
                    Please wait {countdown} seconds before generating key...
                  </p>
                )}

                <button
                  onClick={handleGenerateKey}
                  disabled={!canGenerate || !captchaVerified || loading}
                  className={`w-full p-4 rounded font-bold text-lg ${
                    canGenerate && captchaVerified && !loading
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Generating...' : 'Generate API Key'}
                </button>

                {error && (
                  <div className="mt-4 bg-red-600 p-3 rounded text-sm">
                    {error}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Bottom Sticky Ad (Mobile) */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-2 text-center text-xs text-gray-400 md:hidden">
          <span>Advertisement</span>
          <div className="h-12 bg-gray-700 flex items-center justify-center">
            PopAds Mobile Sticky (320x50)
          </div>
        </div>
      </div>
    </div>
  )
}

export default RedeemPage
