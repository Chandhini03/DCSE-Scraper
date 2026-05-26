import { useState } from 'react'
import StatsBar from './StatsBar'
import { exportToExcel, exportToPdf } from '../api/export'

function Header({ overview, loading, filters }) {
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState(null)

  const handleExportExcel = async () => {
    setExporting(true)
    setExportError(null)
    try {
      await exportToExcel(filters)
    } catch (error) {
      setExportError(error.message)
      console.error('Export to Excel failed:', error)
    } finally {
      setExporting(false)
    }
  }

  const handleExportPdf = async () => {
    setExporting(true)
    setExportError(null)
    try {
      await exportToPdf(filters)
    } catch (error) {
      setExportError(error.message)
      console.error('Export to PDF failed:', error)
    } finally {
      setExporting(false)
    }
  }

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
            disabled={exporting}
            onClick={handleExportExcel}
            title={exporting ? 'Exporting...' : 'Download filtered publications as Excel'}
          >
            {exporting ? 'Exporting...' : 'Download Excel'}
          </button>
          <button
            className="primary-button"
            disabled={exporting}
            onClick={handleExportPdf}
            title={exporting ? 'Exporting...' : 'Download filtered publications as PDF'}
          >
            {exporting ? 'Exporting...' : 'Download PDF'}
          </button>
        </div>
      </div>
      {exportError && (
        <div className="export-error" style={{ color: 'red', padding: '10px', backgroundColor: '#ffe0e0', margin: '10px 0' }}>
          <strong>Export Error:</strong> {exportError}
        </div>
      )}
      <StatsBar overview={overview} loading={loading} />
    </header>
  )
}

export default Header
