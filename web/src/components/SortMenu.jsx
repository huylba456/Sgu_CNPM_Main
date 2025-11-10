const SortMenu = ({ value, onChange }) => (
  <select className="select" value={value} onChange={(event) => onChange(event.target.value)}>
    <option value="featured">Nổi bật</option>
    <option value="priceAsc">Giá tăng dần</option>
    <option value="priceDesc">Giá giảm dần</option>
    <option value="rating">Đánh giá cao</option>
    <option value="delivery">Thời gian giao nhanh</option>
  </select>
);

export default SortMenu;
