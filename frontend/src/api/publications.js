import api from './client'

export const fetchPublications = (params) =>
  api.get('/publications/', { params }).then((response) => response.data)

export const searchPublications = (q, page = 1, limit = 60) =>
  api
    .get('/publications/search', {
      params: {
        q,
        page,
        limit,
      },
    })
    .then((response) => response.data)

export const fetchYears = () =>
  api.get('/publications/years').then((response) => response.data)

export const fetchTypes = () =>
  api.get('/publications/types').then((response) => response.data)
