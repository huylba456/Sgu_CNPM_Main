import { useMemo, useState } from 'react';
import Modal from '../../components/Modal.jsx';
import StatsCard from '../../components/StatsCard.jsx';
import { drones as seedDrones } from '../../data/mockDrones.js';

const createEmptyForm = () => ({
  id: '',
  status: 'Hoạt động',
  battery: 100,
  dailyDeliveries: 0,
  totalDeliveries: 0,
  distance: 0
});

const AdminDronesPage = () => {
  const [drones, setDrones] = useState(seedDrones);
  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [droneToDelete, setDroneToDelete] = useState(null);

  const statusOptions = useMemo(
    () => ['Hoạt động', 'Đang bảo trì', 'Đang sạc', 'Không khả dụng'],
    []
  );

  const openCreate = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEdit = (drone) => {
    setForm({ ...drone });
    setEditingId(drone.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(createEmptyForm());
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'status' || name === 'id' ? value : Number(value)
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      id: form.id.trim(),
      battery: Number(form.battery),
      dailyDeliveries: Number(form.dailyDeliveries),
      totalDeliveries: Number(form.totalDeliveries),
      distance: Number(form.distance)
    };

    if (!payload.id) {
      return;
    }

    if (editingId) {
      setDrones((prev) => prev.map((item) => (item.id === editingId ? { ...payload } : item)));
    } else {
      setDrones((prev) => [...prev, payload]);
    }

    closeModal();
  };

  const confirmDelete = (drone) => {
    setDroneToDelete(drone);
  };

  const handleDelete = () => {
    if (!droneToDelete) return;
    const deletedId = droneToDelete.id;
    setDrones((prev) => prev.filter((item) => item.id !== deletedId));
    if (editingId === deletedId) {
      setIsModalOpen(false);
      setEditingId(null);
      setForm(createEmptyForm());
    }
    setDroneToDelete(null);
  };

  const totalActive = drones.filter((drone) => drone.status === 'Hoạt động').length;
  const averageBattery = Math.round(
    drones.reduce((sum, drone) => sum + drone.battery, 0) / Math.max(1, drones.length)
  );
  const totalDistance = drones.reduce((sum, drone) => sum + drone.distance, 0);

  return (
    <div className="page dashboard">
      <h2>Quản lý đội drone</h2>
      <p className="muted">Theo dõi tình trạng đội drone và cập nhật lịch trình vận hành.</p>
      <div className="stat-grid">
        <StatsCard title="Tổng drone" value={drones.length} trend={`${totalActive} đang hoạt động`} />
        <StatsCard title="Pin trung bình" value={`${averageBattery}%`} trend="Mức pin hiện tại" />
        <StatsCard title="Quãng đường" value={`${totalDistance} km`} trend="Đã di chuyển toàn đội" />
      </div>
      <div className="toolbar">
        <button type="button" className="primary" onClick={openCreate}>
          Thêm drone
        </button>
      </div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã drone</th>
              <th>Tình trạng</th>
              <th>Pin (%)</th>
              <th>Đơn hôm nay</th>
              <th>Tổng đơn</th>
              <th>Quãng đường (km)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {drones.map((drone) => (
              <tr key={drone.id}>
                <td>{drone.id}</td>
                <td>{drone.status}</td>
                <td>{drone.battery}%</td>
                <td>{drone.dailyDeliveries}</td>
                <td>{drone.totalDeliveries}</td>
                <td>{drone.distance} km</td>
                <td>
                  <div className="table-actions">
                    <button type="button" onClick={() => openEdit(drone)}>
                      Sửa
                    </button>
                    <button type="button" className="danger" onClick={() => confirmDelete(drone)}>
                      Xoá
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <Modal title={editingId ? 'Cập nhật drone' : 'Thêm drone mới'} onClose={closeModal}>
          <form className="form" onSubmit={handleSubmit}>
            <div className="grid two form-grid">
              <label className="form-field">
                Mã drone
                <input name="id" value={form.id} onChange={handleChange} required />
              </label>
              <label className="form-field">
                Tình trạng
                <select name="status" value={form.status} onChange={handleChange}>
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                Pin (%)
                <input
                  type="number"
                  name="battery"
                  value={form.battery}
                  min="0"
                  max="100"
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="form-field">
                Đơn hôm nay
                <input
                  type="number"
                  name="dailyDeliveries"
                  value={form.dailyDeliveries}
                  onChange={handleChange}
                  min="0"
                  required
                  disabled={Boolean(editingId)}
                />
              </label>
              <label className="form-field">
                Tổng đơn
                <input
                  type="number"
                  name="totalDeliveries"
                  value={form.totalDeliveries}
                  onChange={handleChange}
                  min="0"
                  required
                  disabled={Boolean(editingId)}
                />
              </label>
              <label className="form-field">
                Quãng đường (km)
                <input
                  type="number"
                  name="distance"
                  value={form.distance}
                  onChange={handleChange}
                  min="0"
                  required
                  disabled={Boolean(editingId)}
                />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="ghost-button" onClick={closeModal}>
                Hủy
              </button>
              <button type="submit" className="primary">
                {editingId ? 'Lưu thay đổi' : 'Thêm drone'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {droneToDelete && (
        <Modal title="Xóa drone" onClose={() => setDroneToDelete(null)}>
          <p>
            Bạn có chắc chắn muốn xóa drone <strong>{droneToDelete.id}</strong> không?
          </p>
          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={() => setDroneToDelete(null)}>
              Không
            </button>
            <button type="button" className="danger" onClick={handleDelete}>
              Có, xóa drone
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminDronesPage;
