function FilterBar({ filters, authors, years, onChange, onApply, onReset }) {
  return (
    <div className="filter-bar">
      <div className="filter-row">
        <label>
          Search
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(event) =>
              onChange({ searchQuery: event.target.value })
            }
            onKeyDown={(e) => e.key === 'Enter' && onApply()}
            placeholder="Search titles or authors"
          />
        </label>
        <label>
          Faculty
          <select
            value={filters.authorId}
            onChange={(event) =>
              onChange({ authorId: event.target.value })
            }
            onKeyDown={(e) => e.key === 'Enter' && onApply()}
          >
            <option value="">All faculty</option>
            {authors.map((author) => (
              <option key={author._id} value={author._id}>
                {author.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Year
          <select
            value={filters.year}
            onChange={(event) =>
              onChange({ year: event.target.value })
            }
            onKeyDown={(e) => e.key === 'Enter' && onApply()}
          >
            <option value="">All years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label>
          Type
          <select
            value={filters.pubType || ""}
            onChange={(event) =>
              onChange({ pubType: event.target.value })
            }
            onKeyDown={(e) => e.key === 'Enter' && onApply()}
          >
            <option value="">All publications</option>
            <option value="journal">Journals only</option>
            <option value="conference">Conferences only</option>
            <option value="book">Books only</option>
          </select>
        </label>
      </div>
      {!filters.year && (
        <div className="filter-row">
          <label>
            Year from
            <input
              type="number"
              value={filters.yearFrom}
              onChange={(event) =>
                onChange({ yearFrom: event.target.value })
              }
              onKeyDown={(e) => e.key === 'Enter' && onApply()}
              placeholder="2020"
            />
          </label>
          <label>
            Year to
            <input
              type="number"
              value={filters.yearTo}
              onChange={(event) => onChange({ yearTo: event.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && onApply()}
              placeholder="2024"
            />
          </label>
          <label>
            Min citations
            <input
              type="number"
              min="0"
              value={filters.minCitations}
              onChange={(event) =>
                onChange({ minCitations: event.target.value })
              }
              onKeyDown={(e) => e.key === 'Enter' && onApply()}
              placeholder="0"
            />
          </label>
        </div>
      )}
      <div className="filter-row filter-row-actions">
        <label>
          Sort by
          <select
            value={filters.sortBy}
            onChange={(event) =>
              onChange({ sortBy: event.target.value })
            }
            onKeyDown={(e) => e.key === 'Enter' && onApply()}
          >
            <option value="cited_by">Citations</option>
            <option value="year">Year</option>
            <option value="title">Title</option>
            <option value="author_name">Author</option>
          </select>
        </label>
        <label className="order-toggle">
          Order
          <select
            value={filters.order}
            onChange={(event) => onChange({ order: event.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && onApply()}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
        <div className="filter-actions">
          <button type="button" className="primary-button" onClick={onApply}>
            Apply Filters
          </button>
          <button type="button" className="secondary-button" onClick={onReset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterBar
