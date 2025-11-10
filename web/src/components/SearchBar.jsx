const SearchBar = ({ value, onChange, placeholder = 'Tìm món ăn hoặc nhà hàng...' }) => (
  <input
    className="search-input"
    type="search"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
  />
);

export default SearchBar;
