import { Routes, Route } from 'react-router-dom';
import WorksList from './pages/WorksList';
import WorkDashboard from './pages/WorkDashboard';

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-primary-800 text-white py-4 shadow-md">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-xl font-semibold tracking-tight">
            Electronic Measurement Book
          </h1>
          <p className="text-primary-300 text-sm mt-1">
            Nanded Municipal Corporation - Demo System
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<WorksList />} />
          <Route path="/works" element={<WorksList />} />
          <Route path="/works/:id" element={<WorkDashboard />} />
        </Routes>
      </main>

      <footer className="bg-slate-100 border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          e-MB Demo System © 2026 | For demonstration purposes only
        </div>
      </footer>
    </div>
  );
}

export default App;