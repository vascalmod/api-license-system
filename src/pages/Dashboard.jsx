import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()
  const [apiKey, setApiKey] = useState('')
  const [licenseInfo, setLicenseInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const checkLicense = async () => {
    if (!apiKey) {
      setError('Please enter your API key')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/check-key?api_key=${encodeURIComponent(apiKey)}`)
      const data = await response.json()

      if (data.valid !== undefined) {
        setLicenseInfo(data)
      } else {
        setError(data.error || 'Failed to check key')
      }
    } catch (err) {
      setError('Failed to check API key')
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold mb-6 text-center">API License Dashboard</h1>

          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Enter Your API Key:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="ak_..."
                className="flex-1 bg-gray-700 p-3 rounded font-mono text-sm"
              />
              <button
                onClick={checkLicense}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded whitespace-nowrap"
              >
                {loading ? 'Checking...' : 'Check'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-600 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {licenseInfo && (
            <div className="bg-gray-900 p-4 rounded">
              <h2 className="text-xl font-bold mb-4">License Status</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-700 p-3 rounded">
                  <p className="text-sm text-gray-400">Status</p>
                  <p className={`font-bold ${
                    licenseInfo.status === 'active' ? 'text-green-400' : 
                    licenseInfo.status === 'expired' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {licenseInfo.status.toUpperCase()}
                  </p>
                </div>
                <div className="bg-gray-700 p-3 rounded">
                  <p className="text-sm text-gray-400">Requests</p>
                  <p className="font-bold">{licenseInfo.request_count || 0}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-400">Created At:</p>
                <p className="font-mono text-sm">{new Date(licenseInfo.created_at).toLocaleString()}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-400">Expires At:</p>
                <p className="font-mono text-sm">{new Date(licenseInfo.expires_at).toLocaleString()}</p>
              </div>

              {licenseInfo.status === 'expired' && (
                <div className="bg-yellow-900 border border-yellow-700 p-4 rounded">
                  <p className="mb-2">Your license has expired.</p>
                  <button
                    onClick={() => navigate('/redeem')}
                    className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded"
                  >
                    Generate New Key
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <a href="/redeem" className="text-blue-400 hover:underline">
              Generate New API Key
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

export default Dashboard
