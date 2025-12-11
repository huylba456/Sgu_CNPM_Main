import PropTypes from 'prop-types';
import './RevenueChart.css';

const RevenueChart = ({ data, title, subtitle }) => {
  if (!data.length) {
    return (
      <div className="panel">
        <h3>{title}</h3>
        {subtitle ? <p className="muted">{subtitle}</p> : null}
        <p className="muted">Chưa có dữ liệu doanh thu.</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const points = data
    .map((item, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 100;
      const y = 100 - (item.value / maxValue) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="panel">
      <div className="chart-header">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p className="muted">{subtitle}</p> : null}
        </div>
        <div className="chart-legend">
          <span className="legend-dot" />
          <span>Doanh thu</span>
        </div>
      </div>
      <div className="chart-shell">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="revenue-chart">
          <polyline fill="url(#chart-fill)" stroke="none" points={`0,100 ${points} 100,100`} />
          <polyline className="revenue-line" fill="none" points={points} />
          <defs>
            <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.4)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0.05)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="chart-grid">
          {data.map((item) => (
            <div key={item.label} className="chart-tick">
              <span className="chart-value">{item.value.toLocaleString('vi-VN')}</span>
              <span className="chart-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

RevenueChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired
    })
  ).isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string
};

RevenueChart.defaultProps = {
  subtitle: ''
};

export default RevenueChart;
