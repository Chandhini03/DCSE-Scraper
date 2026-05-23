function PublicationCard({ publication }) {
  const { title, link, author_name, year, cited_by } = publication

  return (
    <article className="publication-card">
      <h3 className="publication-title">
        {link ? (
          <a href={link} target="_blank" rel="noreferrer">
            {title}
          </a>
        ) : (
          <span>{title}</span>
        )}
      </h3>
      <div className="publication-details">
        <span>{author_name}</span>
        <span>{year ?? 'N/A'}</span>
        <span className="citation-pill">📚 {cited_by ?? 0}</span>
      </div>
    </article>
  )
}

export default PublicationCard
