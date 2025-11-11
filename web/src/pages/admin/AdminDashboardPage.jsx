import { useMemo, useState } from 'react';
import StatsCard from '../../components/StatsCard.jsx';
import DataTable from '../../components/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import { initialOrders } from '../../data/mockOrders.js';
import { products } from '../../data/mockProducts.js';
import { users } from '../../data/mockUsers.js';
import { drones as seedDrones } from '../../data/mockDrones.js';

const AdminDashboardPage = () => {
  const latestOrders = initialOrders.slice(0, 3);
  const topProducts = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4)
    .map((item) => ({ name: item.name, restaurant: item.restaurant, rating: item.rating }));

  const [setDrones] = useState(seedDrones);
  const [isDroneModalOpen, setIsDroneModalOpen] = useState(false);
  const [editingDroneId, setEditingDroneId] = useState(null);
  const [droneToDelete, setDroneToDelete] = useState(null);
  const [droneForm, setDroneForm] = useState({
    id: '',
    status: 'Hoạt động',
    battery: 100,
    dailyDeliveries: 0,
    totalDeliveries: 0,
    distance: 0
  });

  const columns = [
    {
      header: 'Món ăn',
      accessorKey: 'name'
    },
    {
      header: 'Nhà hàng',
      accessorKey: 'restaurant'
    },
    {
      header: 'Đánh giá',
      accessorKey: 'rating'
    }
  ];

  const droneStatusOptions = useMemo(
    () => ['Hoạt động', 'Đang bảo trì', 'Đang sạc', 'Không khả dụng'],
    []
  );

  // const openCreateDrone = () => {
  //   setDroneForm({
  //     id: '',
  //     status: 'Hoạt động',
  //     battery: 100,
  //     dailyDeliveries: 0,
  //     totalDeliveries: 0,
  //     distance: 0
  //   });
  //   setEditingDroneId(null);
  //   setIsDroneModalOpen(true);
  // };

  // const openEditDrone = (drone) => {
  //   setDroneForm({ ...drone });
  //   setEditingDroneId(drone.id);
  //   setIsDroneModalOpen(true);
  // };

  const handleDroneChange = (event) => {
    const { name, value } = event.target;
    setDroneForm((prev) => ({
      ...prev,
      [name]: name === 'battery' || name.includes('Deliveries') || name === 'distance' ? Number(value) : value
    }));
  };

  const handleDroneSubmit = (event) => {
    event.preventDefault();
    if (editingDroneId) {
      setDrones((prev) =>
        prev.map((item) => (item.id === editingDroneId ? { ...item, ...droneForm, id: droneForm.id } : item))
      );
    } else {
      setDrones((prev) => [...prev, { ...droneForm }]);
    }
    closeDroneModal();
  };

  // const confirmDeleteDrone = (drone) => {
  //   setDroneToDelete(drone);
  // };

  const handleDeleteDrone = () => {
    if (!droneToDelete) return;
    setDrones((prev) => prev.filter((drone) => drone.id !== droneToDelete.id));
    if (editingDroneId === droneToDelete.id) {
      setEditingDroneId(null);
    }
    setDroneToDelete(null);
  };

  const closeDroneModal = () => {
    setIsDroneModalOpen(false);
    setEditingDroneId(null);
  };

  return (
    <div className="page dashboard">
      <h2>Dashboard tổng quan</h2>
      <div className="stat-grid">
        <StatsCard title="Tổng doanh thu" value="₫ 4.8B" trend="+18% so với tháng trước" />
        <StatsCard title="Đơn hàng trong ngày" value="128" trend="+5% so với hôm qua" />
        <StatsCard title="Khách hàng mới" value={`${users.length}`} trend="+32% tuần này" />
      </div>
      <section className="panel">
        <h3>Đơn hàng gần nhất</h3>
        <div className="order-list compact">
          {latestOrders.map((order) => (
            <div key={order.id} className="order-card compact">
              <h4>{order.id}</h4>
              <p>{order.customerName}</p>
              <p className={`status ${order.status}`}>{order.status}</p>
              <span>{order.total.toLocaleString()} đ</span>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <h3>Món ăn được yêu thích</h3>
        <DataTable columns={columns} data={topProducts} />
      </section>
      {/* <section className="panel">
        <div className="panel-header">
          <h3>Đội drone</h3>
          <button type="button" className="primary" onClick={openCreateDrone}>
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
                      <button type="button" onClick={() => openEditDrone(drone)}>
                        Sửa
                      </button>
                      <button type="button" className="danger" onClick={() => confirmDeleteDrone(drone)}>
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section> */}
      {isDroneModalOpen && (
        <Modal title={editingDroneId ? 'Cập nhật drone' : 'Thêm drone mới'} onClose={closeDroneModal}>
          <form className="form" onSubmit={handleDroneSubmit}>
            <div className="grid two">
              <label>
                Mã drone
                <input name="id" value={droneForm.id} onChange={handleDroneChange} required />
              </label>
              <label>
                Tình trạng
                <select name="status" value={droneForm.status} onChange={handleDroneChange}>
                  {droneStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Pin (%)
                <input
                  type="number"
                  name="battery"
                  value={droneForm.battery}
                  min="0"
                  max="100"
                  onChange={handleDroneChange}
                  required
                />
              </label>
              <label>
                Đơn hôm nay
                <input
                  type="number"
                  name="dailyDeliveries"
                  value={droneForm.dailyDeliveries}
                  onChange={handleDroneChange}
                  min="0"
                  required
                  disabled={Boolean(editingDroneId)}
                />
              </label>
              <label>
                Tổng đơn
                <input
                  type="number"
                  name="totalDeliveries"
                  value={droneForm.totalDeliveries}
                  onChange={handleDroneChange}
                  min="0"
                  required
                  disabled={Boolean(editingDroneId)}
                />
              </label>
              <label>
                Quãng đường (km)
                <input
                  type="number"
                  name="distance"
                  value={droneForm.distance}
                  onChange={handleDroneChange}
                  min="0"
                  required
                  disabled={Boolean(editingDroneId)}
                />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="ghost-button" onClick={closeDroneModal}>
                Hủy
              </button>
              <button type="submit" className="primary">
                {editingDroneId ? 'Lưu thay đổi' : 'Thêm drone'}
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
            <button type="button" className="danger" onClick={handleDeleteDrone}>
              Có, xóa drone
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboardPage;
