import { useCallback, useEffect, useState } from 'react'
import {
  fetchPublications,
  searchPublications,
} from '../api/publications'

const defaultFilters = {
  searchQuery: '',
  authorId: '',
  year: '',
  yearFrom: '',
  yearTo: '',
  minCitations: '',
  sortBy: 'cited_by',
  order: 'desc',
  pubType: '',
}

const initialColumnState = {
  results: [],
  page: 1,
  total_pages: 1,
  loading: false,
  error: null,
  hasMore: true,
}

const buildParams = (filters, extra = {}) => {
  const params = {
    ...extra,
    sort_by: filters.sortBy,
    order: filters.order,
  }

  if (filters.authorId) params.author_id = filters.authorId
  if (filters.year) params.year = filters.year
  if (filters.yearFrom) params.year_from = filters.yearFrom
  if (filters.yearTo) params.year_to = filters.yearTo
  if (filters.minCitations) params.min_citations = filters.minCitations
  if (filters.pubType) params.pub_type = filters.pubType

  return params
}

const splitResultsByType = (results) => {
  return {
    journal: results.filter((item) => item.pub_type === 'journal'),
    conference: results.filter((item) => item.pub_type === 'conference'),
    book: results.filter((item) => item.pub_type === 'book'),
  }
}

const usePublications = () => {
  const [filters, setFilters] = useState(defaultFilters)
  const [journalData, setJournalData] = useState(initialColumnState)
  const [conferenceData, setConferenceData] = useState(initialColumnState)
  const [bookData, setBookData] = useState(initialColumnState)
  const [searchMode, setSearchMode] = useState(false)
  const [searchPage, setSearchPage] = useState(1)
  const [searchTotalPages, setSearchTotalPages] = useState(1)

  const resetColumnState = () => ({
    ...initialColumnState,
    results: [],
  })

  const loadAll = useCallback(
    async (activeFilters = filters) => {
      const normalizedFilters = {
        ...defaultFilters,
        ...activeFilters,
      }

      if (normalizedFilters.searchQuery.trim()) {
        setSearchMode(true)
        setSearchPage(1)
        setSearchTotalPages(1)
        setJournalData((prev) => ({ ...prev, loading: true, error: null }))
        setConferenceData((prev) => ({ ...prev, loading: true, error: null }))
        setBookData((prev) => ({ ...prev, loading: true, error: null }))

        try {
          const response = await searchPublications(
            normalizedFilters.searchQuery.trim(),
            1,
            60,
          )
          const split = splitResultsByType(response.results || [])
          const hasMore = response.page < response.total_pages

          setJournalData({
            ...resetColumnState(),
            results: split.journal,
            page: response.page,
            total_pages: response.total_pages,
            loading: false,
            error: null,
            hasMore,
          })
          setConferenceData({
            ...resetColumnState(),
            results: split.conference,
            page: response.page,
            total_pages: response.total_pages,
            loading: false,
            error: null,
            hasMore,
          })
          setBookData({
            ...resetColumnState(),
            results: split.book,
            page: response.page,
            total_pages: response.total_pages,
            loading: false,
            error: null,
            hasMore,
          })
          setSearchTotalPages(response.total_pages)
        } catch (error) {
          const message =
            error?.response?.data?.detail || 'Unable to load publications.'
          setJournalData((prev) => ({ ...prev, loading: false, error: message }))
          setConferenceData((prev) => ({ ...prev, loading: false, error: message }))
          setBookData((prev) => ({ ...prev, loading: false, error: message }))
        }

        return
      }

      setSearchMode(false)
      setSearchPage(1)
      setSearchTotalPages(1)

      setJournalData((prev) => ({ ...resetColumnState(), loading: true }))
      setConferenceData((prev) => ({ ...resetColumnState(), loading: true }))
      setBookData((prev) => ({ ...resetColumnState(), loading: true }))

      const journalParams = buildParams(normalizedFilters, {
        pub_type: 'journal',
        page: 1,
        limit: 20,
      })
      const conferenceParams = buildParams(normalizedFilters, {
        pub_type: 'conference',
        page: 1,
        limit: 20,
      })
      const bookParams = buildParams(normalizedFilters, {
        pub_type: 'book',
        page: 1,
        limit: 20,
      })

      try {
        const [journalResponse, conferenceResponse, bookResponse] = await Promise.all([
          fetchPublications(journalParams),
          fetchPublications(conferenceParams),
          fetchPublications(bookParams),
        ])

        setJournalData({
          ...resetColumnState(),
          results: journalResponse.results || [],
          page: journalResponse.page || 1,
          total_pages: journalResponse.total_pages || 1,
          loading: false,
          error: null,
          hasMore:
            (journalResponse.page || 1) < (journalResponse.total_pages || 1),
        })
        setConferenceData({
          ...resetColumnState(),
          results: conferenceResponse.results || [],
          page: conferenceResponse.page || 1,
          total_pages: conferenceResponse.total_pages || 1,
          loading: false,
          error: null,
          hasMore:
            (conferenceResponse.page || 1) <
            (conferenceResponse.total_pages || 1),
        })
        setBookData({
          ...resetColumnState(),
          results: bookResponse.results || [],
          page: bookResponse.page || 1,
          total_pages: bookResponse.total_pages || 1,
          loading: false,
          error: null,
          hasMore:
            (bookResponse.page || 1) < (bookResponse.total_pages || 1),
        })
      } catch (error) {
        const message =
          error?.response?.data?.detail || 'Unable to load publications.'
        setJournalData((prev) => ({ ...prev, loading: false, error: message }))
        setConferenceData((prev) => ({ ...prev, loading: false, error: message }))
        setBookData((prev) => ({ ...prev, loading: false, error: message }))
      }
    },
    [filters],
  )

  const loadMore = useCallback(
    async (columnType) => {
      if (searchMode) {
        if (searchPage >= searchTotalPages) {
          return
        }

        const nextPage = searchPage + 1
        const query = filters.searchQuery.trim()

        try {
          const response = await searchPublications(query, nextPage, 60)
          const split = splitResultsByType(response.results || [])
          const hasMore = response.page < response.total_pages

          setSearchPage(response.page)
          setSearchTotalPages(response.total_pages)

          setJournalData((prev) => ({
            ...prev,
            results: [...prev.results, ...split.journal],
            page: response.page,
            total_pages: response.total_pages,
            hasMore,
          }))
          setConferenceData((prev) => ({
            ...prev,
            results: [...prev.results, ...split.conference],
            page: response.page,
            total_pages: response.total_pages,
            hasMore,
          }))
          setBookData((prev) => ({
            ...prev,
            results: [...prev.results, ...split.book],
            page: response.page,
            total_pages: response.total_pages,
            hasMore,
          }))
        } catch (error) {
          const message =
            error?.response?.data?.detail || 'Unable to load more results.'
          if (columnType === 'journal') {
            setJournalData((prev) => ({ ...prev, error: message }))
          }
          if (columnType === 'conference') {
            setConferenceData((prev) => ({ ...prev, error: message }))
          }
          if (columnType === 'book') {
            setBookData((prev) => ({ ...prev, error: message }))
          }
        }

        return
      }

      const columnState =
        columnType === 'journal'
          ? journalData
          : columnType === 'conference'
          ? conferenceData
          : bookData
      const nextPage = columnState.page + 1

      const params = buildParams(filters, {
        pub_type: columnType,
        page: nextPage,
        limit: 20,
      })

      const updateColumn = (setter) => async () => {
        setter((prev) => ({ ...prev, loading: true, error: null }))
        try {
          const response = await fetchPublications(params)
          setter((prev) => ({
            ...prev,
            results: [...prev.results, ...(response.results || [])],
            page: response.page || nextPage,
            total_pages: response.total_pages || prev.total_pages,
            loading: false,
            error: null,
            hasMore:
              (response.page || nextPage) <
              (response.total_pages || prev.total_pages),
          }))
        } catch (error) {
          const message =
            error?.response?.data?.detail || 'Unable to load more results.'
          setter((prev) => ({ ...prev, loading: false, error: message }))
        }
      }

      if (columnType === 'journal') {
        await updateColumn(setJournalData)()
      } else if (columnType === 'conference') {
        await updateColumn(setConferenceData)()
      } else if (columnType === 'book') {
        await updateColumn(setBookData)()
      }
    },
    [searchMode, searchPage, searchTotalPages, filters, journalData, conferenceData, bookData],
  )

  const applyFilters = useCallback(
    (newFilters) => {
      const merged = {
        ...filters,
        ...newFilters,
      }
      setFilters(merged)
      loadAll(merged)
    },
    [filters, loadAll],
  )

  const reset = useCallback(() => {
    setFilters(defaultFilters)
    loadAll(defaultFilters)
  }, [loadAll])

  useEffect(() => {
    loadAll(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    filters,
    setFilters,
    journalData,
    conferenceData,
    bookData,
    searchMode,
    loadAll,
    loadMore,
    applyFilters,
    reset,
  }
}

export default usePublications
