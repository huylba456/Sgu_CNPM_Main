import { useMemo, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import { useRestaurants } from '../../hooks/useRestaurants.js';

const defaultRestaurantImage = '/images/foodfast-placeholder.svg';

const AdminRestaurantManagePage = () => {
  const { restaurants, addRestaurant, deleteRestaurant } = useRestaurants();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);
  const [restaurantDeleteError, setRestaurantDeleteError] = useState('');
  const [form, setForm] = useState({
    newRestaurantName: '',
    newRestaurantAddress: '',
    newRestaurantImage: ''
  });

  const columns = useMemo(
    () => [
      { header: 'Tên nhà hàng', accessorKey: 'name' },
      { header: 'Địa chỉ', accessorKey: 'address' },
      { header: 'Liên hệ', accessorKey: 'contact' },
      {
        header: 'Hành động',
        cell: ({ row }) => (
          <div className="table-actions">
            <button type="button" className="danger" onClick={() => setRestaurantToDelete(row.original)}>
              Xoá
            </button>
          </div>
        )
      }
    ],
    []
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRestaurantImageChange = (event) => {
    const [file] = event.target.files;
    if (file) {
      setForm((prev) => ({ ...prev, newRestaurantImage: `/images/${file.name}` }));
    }
  };

  const resetForm = () => {
    setForm({
      newRestaurantName: '',
      newRestaurantAddress: '',
      newRestaurantImage: ''
    });
  };

  const closeModal = () => {
    resetForm();
    setIsModalOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.newRestaurantName.trim()) {
      return alert('Vui lòng nhập tên nhà hàng.');
    }

    addRestaurant({
      name: form.newRestaurantName.trim(),
      address: form.newRestaurantAddress.trim(),
      image: form.newRestaurantImage || defaultRestaurantImage
    });

    closeModal();
  };

  const closeRestaurantDeleteModal = () => {
    setRestaurantToDelete(null);
    setRestaurantDeleteError('');
  };

  const handleDeleteRestaurant = async () => {
    if (!restaurantToDelete) return;

    try {
      await deleteRestaurant(restaurantToDelete.id);
      setRestaurantDeleteError('');
      setRestaurantToDelete(null);
    } catch (error) {
      setRestaurantDeleteError(error.message ?? 'Không thể xóa nhà hàng.');
    }
  };

  return (
    <div className="page dashboard">
      <h2>Quản lý nhà hàng</h2>
      <div className="toolbar">
        <p className="muted">Thêm, xóa và quản lý danh sách nhà hàng. Xóa nhà hàng sẽ được kiểm tra ràng buộc với món ăn và đơn hàng.</p>
        <button type="button" className="primary" onClick={() => setIsModalOpen(true)}>
          Thêm nhà hàng
        </button>
      </div>
      <DataTable columns={columns} data={restaurants} />

      {isModalOpen && (
        <Modal title="Thêm nhà hàng" onClose={closeModal}>
          <form className="form" onSubmit={handleSubmit}>
            <label className="form-field">
              Tên nhà hàng
              <input
                name="newRestaurantName"
                value={form.newRestaurantName}
                onChange={handleChange}
                placeholder="Nhập tên nhà hàng"
                required
              />
            </label>
            <label className="form-field">
              Địa chỉ nhà hàng (tuỳ chọn)
              <input
                name="newRestaurantAddress"
                value={form.newRestaurantAddress}
                onChange={handleChange}
                placeholder="Địa chỉ hoặc khu vực phục vụ"
              />
            </label>
            <label className="form-field file-upload">
              Ảnh nhà hàng
              <div className="file-upload-control">
                <label htmlFor="manage-restaurant-image" className="upload-button">
                  Upload
                </label>
                <span>{form.newRestaurantImage ? form.newRestaurantImage.split('/').pop() : 'Chưa có tệp'}</span>
                <input
                  id="manage-restaurant-image"
                  type="file"
                  accept="image/*"
                  onChange={handleRestaurantImageChange}
                />
              </div>
            </label>
            <div className="modal-actions">
              <button type="button" className="ghost-button" onClick={closeModal}>
                Hủy
              </button>
              <button type="submit" className="primary">
                Thêm nhà hàng
              </button>
            </div>
          </form>
        </Modal>
      )}

      {restaurantToDelete && (
        <Modal title="Xóa nhà hàng" onClose={closeRestaurantDeleteModal}>
          {restaurantDeleteError ? <div className="alert warning">{restaurantDeleteError}</div> : null}
          <p>
            Bạn có chắc chắn muốn xóa nhà hàng <strong>{restaurantToDelete.name}</strong> không?
          </p>
          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={closeRestaurantDeleteModal}>
              Không
            </button>
            <button type="button" className="danger" onClick={handleDeleteRestaurant}>
              Có, xóa nhà hàng
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminRestaurantManagePage;
