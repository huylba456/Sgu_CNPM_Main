const StatsCard = ({ title, value, trend }) => (
  <div className="card stat">
    <h4>{title}</h4>
    <p className="value">{value}</p>
    {trend && <span className="muted">{trend}</span>}
  </div>
);

export default StatsCard;
