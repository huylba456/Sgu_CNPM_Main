const CategoryFilter = ({ categories, activeCategory, onSelect }) => (
  <div className="chips">
    <button
      type="button"
      className={activeCategory === 'all' ? 'chip active' : 'chip'}
      onClick={() => onSelect('all')}
    >
      Tất cả
    </button>
    {categories.map((category) => (
      <button
        key={category}
        type="button"
        className={activeCategory === category ? 'chip active' : 'chip'}
        onClick={() => onSelect(category)}
      >
        {category}
      </button>
    ))}
  </div>
);

export default CategoryFilter;
