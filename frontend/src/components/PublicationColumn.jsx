import PublicationCard from './PublicationCard'

function PublicationColumn({
  title,
  accentClass,
  data,
  onLoadMore,
  type,
}) {
  return (
    <section className={`publication-column ${accentClass}`}>
      <div className="column-header">
        <div>
          <h2>{title}</h2>
          <span className="count-badge">{data.results.length}</span>
        </div>
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
    </section>
  )
}

export default PublicationColumn
