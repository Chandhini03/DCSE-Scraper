import api from './client'

export const fetchOverview = () =>
  api.get('/stats/overview').then((response) => response.data)
