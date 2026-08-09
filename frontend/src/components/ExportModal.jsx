import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { exportToExcel, exportToPdf } from '../api/export'

const AVAILABLE_FIELDS = [
  { id: 'all_authors', label: 'All Authors' },
  { id: 'title', label: 'Title' },
  { id: 'venue', label: 'Journal/Conference' },
  { id: 'year', label: 'Year' },
  { id: 'pub_type', label: 'Publication Type' },
  { id: 'link', label: 'Link' }
]

function ExportModal({ isOpen, onClose, filters }) {
  const [selectedFields, setSelectedFields] = useState(
    AVAILABLE_FIELDS.reduce((acc, field) => ({ ...acc, [field.id]: true }), {})
  )
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState(null)

  const handleToggle = (id) => {
    setSelectedFields(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const getSelectedFieldIds = () => {
    return Object.keys(selectedFields).filter(id => selectedFields[id])
  }

  const handleExportExcel = async () => {
    const fields = getSelectedFieldIds()
    if (fields.length === 0) {
      setExportError('Please select at least one field.')
      return
    }
    setExporting(true)
    setExportError(null)
    try {
      await exportToExcel({ ...filters, fields })
      onClose()
    } catch (error) {
      setExportError(error.message)
    } finally {
      setExporting(false)
    }
  }

  const handleExportPdf = async () => {
    const fields = getSelectedFieldIds()
    if (fields.length === 0) {
      setExportError('Please select at least one field.')
      return
    }
    setExporting(true)
    setExportError(null)
    try {
      await exportToPdf({ ...filters, fields })
      onClose()
    } catch (error) {
      setExportError(error.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="export-inline-wrapper"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="export-inline-card">
            <h2>Export Data</h2>
            <p>Select the fields you want to include in the export.</p>
            
            <div className="export-field-selection">
              {AVAILABLE_FIELDS.map(field => (
                <label key={field.id} className={`export-field-checkbox ${selectedFields[field.id] ? 'checked' : ''}`}>
                  <input 
                    type="checkbox"
                    checked={selectedFields[field.id]}
                    onChange={() => handleToggle(field.id)}
                  />
                  {field.label}
                </label>
              ))}
            </div>

            {exportError && <div className="export-error" style={{ color: '#FF6B6B', marginBottom: '16px', fontSize: '14px', padding: '12px', background: 'rgba(255, 107, 107, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 107, 107, 0.2)' }}>{exportError}</div>}

            <div className="export-actions">
              <button className="secondary-button" onClick={onClose} disabled={exporting}>Cancel</button>
              <button className="primary-button" onClick={handleExportExcel} disabled={exporting}>
                {exporting ? 'Exporting...' : 'Export Excel'}
              </button>
              <button className="primary-button" onClick={handleExportPdf} disabled={exporting}>
                {exporting ? 'Exporting...' : 'Export PDF'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ExportModal
