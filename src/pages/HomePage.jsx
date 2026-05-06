function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-5xl font-bold mb-6">API License System</h1>
        <p className="text-xl text-gray-300 mb-8">
          Generate API keys with 8-hour validity. Monetized with PopAds integration.
        </p>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-8 text-left">
          <h2 className="text-2xl font-bold mb-4">How to Use</h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">1</span>
              <span>Get a token from Linkvertise or your traffic source</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">2</span>
              <span>Visit <code className="bg-gray-700 px-2 py-1 rounded">/redeem?token=YOUR_TOKEN</code></span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">3</span>
              <span>Complete the hCaptcha verification</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">4</span>
              <span>Generate your API key and use it for 8 hours</span>
            </li>
          </ol>
        </div>

        <div className="bg-yellow-900 border border-yellow-700 p-4 rounded mb-6">
          <p className="text-yellow-200">
            <strong>Note:</strong> You need a valid token to generate an API key. 
            Tokens are typically distributed via Linkvertise or other traffic sources.
          </p>
        </div>

        <a
          href="/redeem"
          className="inline-block bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-bold text-lg"
        >
          Try Demo (No Token)
        </a>
      </div>
    </div>
  )
}

export default HomePage
