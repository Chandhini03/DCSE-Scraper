function StatsBar({ overview, loading }) {
  const items = [
    {
      label: 'Publications',
      value: overview?.total_publications ?? '--',
    },
    {
      label: 'Authors',
      value: overview?.total_authors ?? '--',
    },
    {
      label: 'Citations',
      value: overview?.total_citations ?? '--',
    },
  ]

  return (
    <div className="stats-bar">
      {items.map((item) => (
        <div key={item.label} className="stat-card">
          <span className="stat-label">{item.label}</span>
          <span className="stat-value">
            {loading ? <span className="stat-loading" /> : item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default StatsBar
