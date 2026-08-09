import client from './client'

export const exportToExcel = async (filters) => {
  try {
    const params = new URLSearchParams()
    
    if (filters.authorId) params.append('author_id', filters.authorId)
    if (filters.yearFrom) params.append('year_from', filters.yearFrom)
    if (filters.yearTo) params.append('year_to', filters.yearTo)
    if (filters.year) params.append('year', filters.year)
    if (filters.minCitations) params.append('min_citations', filters.minCitations)
    if (filters.pubType) params.append('pub_type', filters.pubType)
    params.append('sort_by', filters.sortBy || 'cited_by')
    params.append('order', filters.order || 'desc')
    
    if (filters.fields && filters.fields.length > 0) {
      filters.fields.forEach(field => params.append('fields', field))
    }
    
    const url = `${client.defaults.baseURL}/export/excel?${params.toString()}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      let errorMessage = 'Failed to export to Excel'
      try {
        const errorData = await response.json()
        if (errorData.detail) errorMessage = errorData.detail
      } catch (e) {
        // Ignore JSON parse error on non-ok responses
      }
      throw new Error(errorMessage)
    }
    
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    
    const contentDisposition = response.headers.get('content-disposition')
    let filename = 'DCSE_Publications.xlsx'
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/)
      if (match) {
        filename = match[1]
      }
    }
    
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    
    return { success: true, message: 'Excel file downloaded successfully' }
  } catch (error) {
    console.error("Export Excel error:", error);
    throw new Error(error.message || 'Failed to export to Excel')
  }
}

export const exportToPdf = async (filters) => {
  try {
    const params = new URLSearchParams()
    
    if (filters.authorId) params.append('author_id', filters.authorId)
    if (filters.yearFrom) params.append('year_from', filters.yearFrom)
    if (filters.yearTo) params.append('year_to', filters.yearTo)
    if (filters.year) params.append('year', filters.year)
    if (filters.minCitations) params.append('min_citations', filters.minCitations)
    if (filters.pubType) params.append('pub_type', filters.pubType)
    params.append('sort_by', filters.sortBy || 'cited_by')
    params.append('order', filters.order || 'desc')
    
    if (filters.fields && filters.fields.length > 0) {
      filters.fields.forEach(field => params.append('fields', field))
    }
    
    const url = `${client.defaults.baseURL}/export/pdf?${params.toString()}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      let errorMessage = 'Failed to export to PDF'
      try {
        const errorData = await response.json()
        if (errorData.detail) errorMessage = errorData.detail
      } catch (e) {
        // Ignore JSON parse error on non-ok responses
      }
      throw new Error(errorMessage)
    }
    
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    
    const contentDisposition = response.headers.get('content-disposition')
    let filename = 'DCSE_Publications.pdf'
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/)
      if (match) {
        filename = match[1]
      }
    }
    
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    
    return { success: true, message: 'PDF file downloaded successfully' }
  } catch (error) {
    console.error("Export PDF error:", error);
    throw new Error(error.message || 'Failed to export to PDF')
  }
}
