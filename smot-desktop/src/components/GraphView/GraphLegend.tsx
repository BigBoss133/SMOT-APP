const LEGEND = [
  { label: 'Lavoro',         color: '#4338f5' },
  { label: 'Studio',         color: '#894df8' },
  { label: 'Personale',      color: '#bcc41c' },
  { label: 'Non indicizzato',color: '#8a9bb5' },
];

export function GraphLegend() {
  return (
    <div className="graph-legend">
      {LEGEND.map(item => (
        <div key={item.label} className="graph-legend-item">
          <span className="graph-legend-dot" style={{ background: item.color }} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
