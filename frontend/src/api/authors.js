import api from './client'

export const fetchAuthors = () =>
  api.get('/authors/').then((response) => response.data)
