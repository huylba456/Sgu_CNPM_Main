import { useEffect, useMemo, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import { useData } from '../../hooks/useData.js';
import { useRestaurants } from '../../hooks/useRestaurants.js';

const AdminProductsPage = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useData();
  const { restaurants } = useRestaurants();
  const [form, setForm] = useState({
    id: '',
    name: '',
    category: categories[0],
    price: 0,
    restaurant: restaurants[0]?.name ?? '',
    description: '',
    image: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.toLowerCase();
    return products
      .filter(
        (product) =>
          !keyword ||
          product.name.toLowerCase().includes(keyword) ||
          product.restaurant.toLowerCase().includes(keyword)
      )
      .sort((a, b) => {
        const direction = sortDirection === 'asc' ? 1 : -1;
        if (sortBy === 'name') return a.name.localeCompare(b.name) * direction;
        if (sortBy === 'price') return (a.price - b.price) * direction;
        if (sortBy === 'category') return a.category.localeCompare(b.category) * direction;
        return 0;
      });
  }, [products, searchTerm, sortBy, sortDirection]);

  const columns = useMemo(
    () => [
      { header: 'Tên món', accessorKey: 'name' },
      { header: 'Danh mục', accessorKey: 'category' },
      {
        header: 'Giá',
        cell: ({ row }) => `${row.original.price.toLocaleString()} đ`
      },
      { header: 'Nhà hàng', accessorKey: 'restaurant' },
      {
        header: 'Hành động',
        cell: ({ row }) => (
          <div className="table-actions">
            <button type="button" onClick={() => handleEdit(row.original)}>Sửa</button>
            <button type="button" className="danger" onClick={() => promptDelete(row.original)}>
              Xoá
            </button>
          </div>
        )
      }
    ],
    [products]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const [file] = event.target.files;
    if (file) {
      setForm((prev) => ({ ...prev, image: `/images/${file.name}` }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = { ...form, price: Number(form.price) };
    if (editingId) {
      updateProduct(editingId, payload);
    } else {
      addProduct(payload);
    }
    closeModal();
  };

  function handleEdit(product) {
    setForm({ ...product });
    setEditingId(product.id);
    setIsModalOpen(true);
  }

  function promptDelete(product) {
    setProductToDelete(product);
  }

  const handleDelete = () => {
    if (!productToDelete) return;
    deleteProduct(productToDelete.id);
    if (editingId === productToDelete.id) {
      setEditingId(null);
      resetForm();
    }
    setProductToDelete(null);
  };

  const resetForm = () =>
    setForm({
      id: '',
      name: '',
      category: categories[0],
      price: 0,
      restaurant: restaurants[0]?.name ?? '',
      description: '',
      image: ''
    });

  useEffect(() => {
    setForm((prev) => ({ ...prev, restaurant: prev.restaurant || restaurants[0]?.name || '' }));
  }, [restaurants]);

  const closeModal = () => {
    resetForm();
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="page dashboard">
      <h2>Quản lý sản phẩm</h2>
      <div className="toolbar">
        <input
          type="search"
          placeholder="Tìm theo tên món hoặc nhà hàng"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <div className="toolbar-group">
          <label>
            Sắp xếp
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="name">Tên món</option>
              <option value="price">Giá</option>
              <option value="category">Danh mục</option>
            </select>
          </label>
          <button type="button" onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}>
            {sortDirection === 'asc' ? 'Tăng dần' : 'Giảm dần'}
          </button>
        </div>
        <button type="button" className="primary" onClick={handleCreate}>
          Thêm món mới
        </button>
      </div>
      <DataTable columns={columns} data={filteredProducts} />
      {isModalOpen && (
        <Modal title={editingId ? 'Cập nhật món' : 'Thêm món mới'} onClose={closeModal}>
          <form className="form" onSubmit={handleSubmit}>
            <div className="grid two form-grid">
              <label className="form-field">
                Tên món
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>
              <label className="form-field">
                Giá
                <input name="price" type="number" value={form.price} onChange={handleChange} required />
              </label>
              <label className="form-field">
                Danh mục
                <select name="category" value={form.category} onChange={handleChange}>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                Nhà hàng
                <select name="restaurant" value={form.restaurant} onChange={handleChange} required>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.name}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="form-field">
              Mô tả
              <textarea name="description" value={form.description} onChange={handleChange} />
            </label>
            <label className="form-field file-upload">
              Ảnh minh hoạ
              <div className="file-upload-control">
                <label htmlFor="admin-product-image" className="upload-button">
                  Upload
                </label>
                <span>{form.image ? form.image.split('/').pop() : 'Chưa có tệp'}</span>
                <input
                  id="admin-product-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </label>
            <div className="modal-actions">
              <button type="button" className="ghost-button" onClick={closeModal}>
                Hủy
              </button>
              <button type="submit" className="primary">
                {editingId ? 'Lưu thay đổi' : 'Thêm món'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {productToDelete && (
        <Modal title="Xóa món" onClose={() => setProductToDelete(null)}>
          <p>
            Bạn có chắc chắn muốn xóa <strong>{productToDelete.name}</strong> không?
          </p>
          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={() => setProductToDelete(null)}>
              Không
            </button>
            <button type="button" className="danger" onClick={handleDelete}>
              Có, xóa món
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminProductsPage;
