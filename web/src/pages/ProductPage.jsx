import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import SortMenu from '../components/SortMenu.jsx';
import CategoryFilter from '../components/CategoryFilter.jsx';
import { categories, products } from '../data/mockProducts.js';

const sortProducts = (list, sortKey) => {
  switch (sortKey) {
    case 'priceAsc':
      return [...list].sort((a, b) => a.price - b.price);
    case 'priceDesc':
      return [...list].sort((a, b) => b.price - a.price);
    case 'rating':
      return [...list].sort((a, b) => b.rating - a.rating);
    case 'delivery':
      return [...list].sort((a, b) => a.deliveryTime - b.deliveryTime);
    default:
      return list;
  }
};

const ProductsPage = () => {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [category, setCategory] = useState('all');
  const [restaurant, setRestaurant] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const restaurants = useMemo(
    () => Array.from(new Set(products.map((product) => product.restaurant))),
    []
  );

  const filteredItems = useMemo(() => {
    let list = products;

    if (category !== 'all') {
      list = list.filter((product) => product.category === category);
    }

    if (restaurant !== 'all') {
      list = list.filter((product) => product.restaurant === restaurant);
    }

    if (search.trim()) {
      list = list.filter((product) =>
        `${product.name} ${product.restaurant}`.toLowerCase().includes(search.toLowerCase())
      );
    }

    return sortProducts(list, sort);
  }, [category, restaurant, search, sort]);

  useEffect(() => {
    setPage(1);
  }, [category, restaurant, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  return (
    <div className="page catalog-page">
      <header className="catalog-header">
        <div className="catalog-heading">
          <h2>Danh mục món ăn</h2>
          <p className="muted">Khám phá menu theo danh mục món ăn và nhà hàng yêu thích.</p>
        </div>
        <div className="catalog-controls">
          <SearchBar value={search} onChange={setSearch} />
          <SortMenu value={sort} onChange={setSort} />
        </div>
        <div className="catalog-filters">
          <div className="filter-group">
            <span className="filter-label">Danh mục</span>
            <CategoryFilter categories={categories} activeCategory={category} onSelect={setCategory} />
          </div>
          <div className="filter-group">
            <span className="filter-label">Nhà hàng</span>
            <CategoryFilter categories={restaurants} activeCategory={restaurant} onSelect={setRestaurant} />
          </div>
        </div>
      </header>
      {paginatedItems.length ? (
        <>
          <section className="grid">
            {paginatedItems.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </section>
          {totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={pageNumber === currentPage ? 'active' : ''}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <h3>Không tìm thấy món ăn phù hợp</h3>
          <p className="muted">Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác.</p>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
