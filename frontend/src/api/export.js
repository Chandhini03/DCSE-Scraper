import client from './client'

export const exportToExcel = async (filters) => {
  try {
    const params = new URLSearchParams()
    
    if (filters.authorId) params.append('author_id', filters.authorId)
    if (filters.yearFrom) params.append('year_from', filters.yearFrom)
    if (filters.yearTo) params.append('year_to', filters.yearTo)
    if (filters.year) params.append('year', filters.year)
    if (filters.minCitations) params.append('min_citations', filters.minCitations)
    params.append('sort_by', filters.sortBy || 'cited_by')
    params.append('order', filters.order || 'desc')
    
    if (filters.fields && filters.fields.length > 0) {
      filters.fields.forEach(field => params.append('fields', field))
    }
    
    const response = await client.get(`/export/excel?${params.toString()}`, {
      responseType: 'blob'
    })
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    
    // Extract filename from response headers if available
    const contentDisposition = response.headers['content-disposition']
    let filename = 'publications_export.xlsx'
    if (contentDisposition) {
      const match = contentDisposition.match(/filename=(.+)/)
      if (match) {
        filename = match[1].replace(/"/g, '')
      }
    }
    
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    return { success: true, message: 'Excel file downloaded successfully' }
  } catch (error) {
    const message = error?.response?.data?.detail || 'Failed to export to Excel'
    throw new Error(message)
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
    params.append('sort_by', filters.sortBy || 'cited_by')
    params.append('order', filters.order || 'desc')
    
    if (filters.fields && filters.fields.length > 0) {
      filters.fields.forEach(field => params.append('fields', field))
    }
    
    const response = await client.get(`/export/pdf?${params.toString()}`, {
      responseType: 'blob'
    })
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    
    // Extract filename from response headers if available
    const contentDisposition = response.headers['content-disposition']
    let filename = 'publications_export.pdf'
    if (contentDisposition) {
      const match = contentDisposition.match(/filename=(.+)/)
      if (match) {
        filename = match[1].replace(/"/g, '')
      }
    }
    
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    return { success: true, message: 'PDF file downloaded successfully' }
  } catch (error) {
    const message = error?.response?.data?.detail || 'Failed to export to PDF'
    throw new Error(message)
  }
}
