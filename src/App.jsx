import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RedeemPage from './pages/RedeemPage'
import ResultPage from './pages/ResultPage'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/redeem" element={<RedeemPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<RedeemPage />} />
      </Routes>
    </Router>
  )
}

export default App
