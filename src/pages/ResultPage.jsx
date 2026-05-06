import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function ResultPage() {
  const location = useLocation()
  const { api_key, expires_at } = location.state || {}
  const [timeLeft, setTimeLeft] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!api_key || !expires_at) {
      return
    }

    const updateCountdown = () => {
      const now = new Date().getTime()
      const expiry = new Date(expires_at).getTime()
      const distance = expiry - now

      if (distance <= 0) {
        setTimeLeft('EXPIRED')
        return
      }

      const hours = Math.floor(distance / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [api_key, expires_at])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(api_key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!api_key) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">No API Key Found</h1>
          <a href="/redeem" className="text-blue-400 hover:underline">Go to Redeem Page</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Banner Ad */}
      <div className="w-full bg-gray-800 p-2 text-center text-sm text-gray-400">
        <span className="text-xs">Advertisement</span>
        <div className="h-16 bg-gray-700 flex items-center justify-center">
          PopAds Top Banner (728x90)
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold">API Key Generated!</h1>
          </div>

          <div className="bg-gray-900 p-4 rounded mb-6">
            <label className="text-sm text-gray-400 mb-2 block">Your API Key:</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-700 p-3 rounded font-mono text-sm break-all">
                {api_key}
              </code>
              <button
                onClick={copyToClipboard}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded whitespace-nowrap"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-sm text-gray-400">Expires In:</p>
              <p className="text-2xl font-bold text-yellow-400">{timeLeft || '8h 0m 0s'}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-sm text-gray-400">Valid For:</p>
              <p className="text-2xl font-bold">8 Hours</p>
            </div>
          </div>

          <div className="bg-blue-900 border border-blue-700 p-4 rounded mb-6">
            <h3 className="font-bold mb-2">Usage Instructions:</h3>
            <pre className="text-sm bg-gray-900 p-3 rounded overflow-x-auto">
{`curl -H "X-API-Key: ${api_key}" \\
  https://your-api.com/endpoint`}
            </pre>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm mb-4">
              After expiration, return to generate a new key
            </p>
            <a
              href="/redeem"
              className="inline-block bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded"
            >
              Back to Redeem Page
            </a>
          </div>
        </div>

        {/* Mid-Content Ad */}
        <div className="mt-6 p-3 bg-gray-800 rounded text-center text-sm text-gray-400">
          <span className="text-xs">Advertisement</span>
          <div className="h-32 bg-gray-700 flex items-center justify-center mt-2">
            PopAds Mid-Content (300x250)
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultPage
