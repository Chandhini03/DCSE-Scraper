import { useState } from 'react'
import StatsBar from './StatsBar'
import ExportModal from './ExportModal'

function Header({ overview, loading, filters }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <header className="app-header">
      <div className="header-top">
        <div>
          <p className="eyebrow">DCSE Scholar Publications</p>
          <h1>DCSE Faculty Publications</h1>
        </div>
        <div className="header-actions">
          <button
            className="primary-button"
            onClick={() => setModalOpen(true)}
            title="Export filtered publications"
          >
            Export Data
          </button>
        </div>
      </div>
      
      <ExportModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        filters={filters} 
      />

      <StatsBar overview={overview} loading={loading} />
    </header>
  )
}

export default Header

