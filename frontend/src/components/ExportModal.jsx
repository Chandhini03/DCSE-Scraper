import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { exportToExcel, exportToPdf } from '../api/export'

const AVAILABLE_FIELDS = [
  { id: 'author_name', label: 'Author Name' },
  { id: 'title', label: 'Title' },
  { id: 'year', label: 'Year' },
  { id: 'pub_type', label: 'Publication Type' },
  { id: 'link', label: 'Link' },
  { id: 'cited_by', label: 'Citations' }
]

function ExportModal({ isOpen, onClose, filters }) {
  const [selectedFields, setSelectedFields] = useState(
    AVAILABLE_FIELDS.reduce((acc, field) => ({ ...acc, [field.id]: true }), {})
  )
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState(null)

  if (!isOpen) return null

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
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <h2>Export Data</h2>
          <p>Select the fields you want to include in the export.</p>
          
          <div className="field-selection">
            {AVAILABLE_FIELDS.map(field => (
              <label key={field.id} className="field-checkbox">
                <input 
                  type="checkbox"
                  checked={selectedFields[field.id]}
                  onChange={() => handleToggle(field.id)}
                />
                {field.label}
              </label>
            ))}
          </div>

          {exportError && <div className="export-error" style={{color: 'red', marginTop: '10px'}}>{exportError}</div>}

          <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button className="secondary-button" onClick={onClose} disabled={exporting}>Cancel</button>
            <button className="primary-button" onClick={handleExportExcel} disabled={exporting}>
              {exporting ? 'Exporting...' : 'Export Excel'}
            </button>
            <button className="primary-button" onClick={handleExportPdf} disabled={exporting}>
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ExportModal
