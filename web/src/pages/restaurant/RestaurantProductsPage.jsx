import { useEffect, useMemo, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import { products as allProducts, categories } from '../../data/mockProducts.js';
import { useAuth } from '../../hooks/useAuth.js';
import Modal from '../../components/Modal.jsx';

const RestaurantProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState(() =>
    allProducts.filter((product) => product.restaurant === (user?.restaurantName ?? 'FastGrill Station'))
  );
  const [form, setForm] = useState({
    id: '',
    name: '',
    category: categories[0],
    price: 0,
    description: '',
    image: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const columns = useMemo(
    () => [
      { header: 'Tên món', accessorKey: 'name' },
      { header: 'Danh mục', accessorKey: 'category' },
      {
        header: 'Giá',
        cell: ({ row }) => `${row.original.price.toLocaleString()} đ`
      },
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
    const payload = {
      ...form,
      price: Number(form.price),
      restaurant: user?.restaurantName ?? 'FastGrill Station'
    };

    if (editingId) {
      setProducts((prev) => prev.map((item) => (item.id === editingId ? { ...payload, id: item.id } : item)));
    } else {
      setProducts((prev) => [...prev, { ...payload, id: crypto.randomUUID() }]);
    }
    closeModal();
  };

  const handleEdit = (product) => {
    setForm({ ...product });
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  const promptDelete = (product) => {
    setProductToDelete(product);
  };

  const handleDelete = () => {
    if (!productToDelete) return;
    setProducts((prev) => prev.filter((item) => item.id !== productToDelete.id));
    if (editingId === productToDelete.id) {
      setEditingId(null);
      resetForm();
    }
    setProductToDelete(null);
  };

  useEffect(() => {
    if (user?.restaurantName) {
      setProducts(allProducts.filter((product) => product.restaurant === user.restaurantName));
    }
  }, [user?.restaurantName]);

  const resetForm = () =>
    setForm({ id: '', name: '', category: categories[0], price: 0, description: '', image: '' });

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
      <h2>Menu của nhà hàng</h2>
      <div className="toolbar">
        <button type="button" className="primary" onClick={handleCreate}>
          Thêm món mới
        </button>
      </div>
      <DataTable columns={columns} data={products} />
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
            </div>
            <label className="form-field">
              Mô tả
              <textarea name="description" value={form.description} onChange={handleChange} />
            </label>
            <label className="form-field file-upload">
              Ảnh minh hoạ
              <div className="file-upload-control">
                <label htmlFor="restaurant-product-image" className="upload-button">
                  Upload
                </label>
                <span>{form.image ? form.image.split('/').pop() : 'Chưa có tệp'}</span>
                <input
                  id="restaurant-product-image"
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

export default RestaurantProductsPage;
