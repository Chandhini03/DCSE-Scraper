import PublicationCard from './PublicationCard'

function PublicationColumn({
  title,
  accentClass,
  data,
  onLoadMore,
  type,
  expandedColumn,
  setExpandedColumn,
}) {
  const isExpanded = expandedColumn === type

  // hide this column when a different column is expanded
  const hiddenWhenOtherExpanded = expandedColumn && !isExpanded

  const ColumnContent = (
    <>
      <div className="column-header">
        <div>
          <h2>{title}</h2>
          <span className="count-badge">{data.results.length}</span>
        </div>
        <button
          type="button"
          className="expand-button"
          aria-label={isExpanded ? 'Collapse column' : 'Expand column'}
          onClick={() => setExpandedColumn(isExpanded ? null : type)}
        >
          {isExpanded ? '✕' : '⤢'}
        </button>
      </div>
      <div className="column-list">
        {data.loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="card-skeleton" />
          ))
        ) : data.error ? (
          <div className="column-error">{data.error}</div>
        ) : data.results.length === 0 ? (
          <div className="column-empty">No results found.</div>
        ) : (
          data.results.map((publication) => (
            <PublicationCard
              key={publication._id}
              publication={publication}
            />
          ))
        )}
      </div>
      <div className="column-footer">
        {!data.loading && !data.error && data.results.length > 0 && (
          <button
            type="button"
            className="load-more-button"
            onClick={() => onLoadMore(type)}
            disabled={!data.hasMore}
          >
            {data.hasMore ? 'Load More' : 'No more results'}
          </button>
        )}
      </div>
    </>
  )

  return (
    <>
      <section
        className={`publication-column ${accentClass}`}
        style={{ display: hiddenWhenOtherExpanded ? 'none' : undefined }}
      >
        {ColumnContent}
      </section>

      {isExpanded && (
        <div className="expanded-overlay" role="dialog" aria-modal="true">
          <div className={`publication-column ${accentClass} expanded`}>{/* reuse styles */}
            {ColumnContent}
          </div>
        </div>
      )}
    </>
  )
}

export default PublicationColumn
