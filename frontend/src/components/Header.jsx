import StatsBar from './StatsBar'

function Header({ overview, loading }) {
  return (
    <header className="app-header">
      <div className="header-top">
        <div>
          <p className="eyebrow">DCSE Scholar Publications</p>
          <h1>DCSE Faculty Publications</h1>
        </div>
        <div className="header-actions">
          <button className="disabled-button" disabled title="Coming soon">
            Download Excel
          </button>
          <button className="disabled-button" disabled title="Coming soon">
            Download PDF
          </button>
        </div>
      </div>
      <StatsBar overview={overview} loading={loading} />
    </header>
  )
}

export default Header
