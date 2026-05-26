import { useEffect, useState } from 'react'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import PublicationColumn from './components/PublicationColumn'
import usePublications from './hooks/usePublications'
import { fetchAuthors } from './api/authors'
import { fetchYears } from './api/publications'
import { fetchOverview } from './api/stats'
import './App.css'

function App() {
  const {
    filters,
    journalData,
    conferenceData,
    bookData,
    searchMode,
    loadMore,
    applyFilters,
    reset,
    loadAll,
    setFilters,
  } = usePublications()

  const [authors, setAuthors] = useState([])
  const [years, setYears] = useState([])
  const [overview, setOverview] = useState(null)
  const [loadingMeta, setLoadingMeta] = useState(true)
  const [metaError, setMetaError] = useState(null)
  const [expandedColumn, setExpandedColumn] = useState(null)

  useEffect(() => {
    const loadMeta = async () => {
      setLoadingMeta(true)
      try {
        const [overviewData, authorsData, yearsData] = await Promise.all([
          fetchOverview(),
          fetchAuthors(),
          fetchYears(),
        ])
        setOverview(overviewData)
        setAuthors(authorsData)
        setYears(yearsData)
        setMetaError(null)
      } catch (error) {
        setMetaError('Unable to load summary data.')
      } finally {
        setLoadingMeta(false)
      }
    }

    loadMeta()
  }, [])

  useEffect(() => {
    loadAll(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="app-shell">
      <Header overview={overview} loading={loadingMeta} filters={filters} />
      <div className="content-shell">
        <FilterBar
          filters={filters}
          authors={authors}
          years={years}
          onChange={(changes) => {
            setFilters((current) => ({ ...current, ...changes }))
          }}
          onApply={() => applyFilters(filters)}
          onReset={reset}
        />
        {metaError && <div className="meta-error">{metaError}</div>}
        <div className="column-grid">
          <PublicationColumn
            title="Journals"
            accentClass="journal-column"
            data={journalData}
            onLoadMore={loadMore}
            type="journal"
            expandedColumn={expandedColumn}
            setExpandedColumn={setExpandedColumn}
          />
          <PublicationColumn
            title="Conferences"
            accentClass="conference-column"
            data={conferenceData}
            onLoadMore={loadMore}
            type="conference"
            expandedColumn={expandedColumn}
            setExpandedColumn={setExpandedColumn}
          />
          <PublicationColumn
            title="Books"
            accentClass="book-column"
            data={bookData}
            onLoadMore={loadMore}
            type="book"
            expandedColumn={expandedColumn}
            setExpandedColumn={setExpandedColumn}
          />
        </div>
      </div>
    </div>
  )
}

export default App
