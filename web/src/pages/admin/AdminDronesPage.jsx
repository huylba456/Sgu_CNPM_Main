import { useEffect, useMemo, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import { useData } from '../../hooks/useData.js';

const droneStatusOptions = ['Hoạt động', 'Đang bảo trì', 'Đang sạc', 'Không khả dụng'];

const AdminDronesPage = () => {
  const { drones, addDrone, updateDrone, deleteDrone } = useData();
  const [droneForm, setDroneForm] = useState({
    code: '',
    status: 'Hoạt động',
    battery: 100,
    dailyDeliveries: 0,
    totalDeliveries: 0,
    distance: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDroneId, setEditingDroneId] = useState(null);
  const [droneToDelete, setDroneToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('code');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    if (editingDroneId) return;
    setDroneForm({
      code: '',
      status: 'Hoạt động',
      battery: 100,
      dailyDeliveries: 0,
      totalDeliveries: 0,
      distance: 0
    });
  }, [editingDroneId]);

  const filteredDrones = useMemo(() => {
    const keyword = searchTerm.toLowerCase();
    return drones
      .filter((drone) =>
        !keyword
          ? true
          : (drone.code ?? drone.id).toLowerCase().includes(keyword) || drone.status.toLowerCase().includes(keyword)
      )
      .sort((a, b) => {
        const direction = sortDirection === 'asc' ? 1 : -1;
        if (sortBy === 'code') return (a.code ?? a.id).localeCompare(b.code ?? b.id) * direction;
        if (sortBy === 'battery') return (a.battery - b.battery) * direction;
        if (sortBy === 'dailyDeliveries') return (a.dailyDeliveries - b.dailyDeliveries) * direction;
        if (sortBy === 'totalDeliveries') return (a.totalDeliveries - b.totalDeliveries) * direction;
        if (sortBy === 'distance') return (a.distance - b.distance) * direction;
        return a.id.localeCompare(b.id) * direction;
      });
  }, [drones, searchTerm, sortBy, sortDirection]);

  const handleDroneChange = (event) => {
    const { name, value } = event.target;
    setDroneForm((prev) => ({
      ...prev,
      [name]: name === 'battery' || name.includes('Deliveries') || name === 'distance' ? Number(value) : value
    }));
  };

  const handleDroneSubmit = async (event) => {
    event.preventDefault();
    if (editingDroneId) {
      await updateDrone(editingDroneId, { ...droneForm });
    } else {
      await addDrone({ ...droneForm });
    }
    closeModal();
  };

  const confirmDeleteDrone = (drone) => setDroneToDelete(drone);

  const handleDeleteDrone = async () => {
    if (!droneToDelete) return;
    await deleteDrone(droneToDelete.id);
    setDroneToDelete(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDroneId(null);
  };

  const columns = useMemo(
    () => [
      { header: 'Mã drone', accessorKey: 'code' },
      { header: 'ID Firestore', accessorKey: 'id' },
      { header: 'Tình trạng', accessorKey: 'status' },
      { header: 'Pin (%)', accessorKey: 'battery' },
      { header: 'Đơn hôm nay', accessorKey: 'dailyDeliveries' },
      { header: 'Tổng đơn', accessorKey: 'totalDeliveries' },
      { header: 'Quãng đường (km)', accessorKey: 'distance' },
      {
        header: 'Hành động',
        cell: ({ row }) => (
          <div className="table-actions">
            <button type="button" onClick={() => openEditDrone(row.original)}>Sửa</button>
            <button type="button" className="danger" onClick={() => confirmDeleteDrone(row.original)}>
              Xoá
            </button>
          </div>
        )
      }
    ],
    [drones]
  );

  const openCreateDrone = () => {
    setDroneForm({
      code: '',
      status: 'Hoạt động',
      battery: 100,
      dailyDeliveries: 0,
      totalDeliveries: 0,
      distance: 0
    });
    setEditingDroneId(null);
    setIsModalOpen(true);
  };

  const openEditDrone = (drone) => {
    setEditingDroneId(drone.id);
    setDroneForm({ ...drone, code: drone.code ?? drone.id });
    setIsModalOpen(true);
  };

  const totalActive = drones.filter((drone) => drone.status === 'Hoạt động').length;
  const totalBattery =
    drones.reduce((sum, drone) => sum + (Number.isFinite(drone.battery) ? drone.battery : 0), 0) /
    Math.max(1, drones.length);
  const totalDistance = drones.reduce((sum, drone) => sum + (drone.distance ?? 0), 0);

  return (
    <div className="page dashboard">
      <h2>Đội drone</h2>
      <div className="toolbar">
        <input
          type="search"
          placeholder="Tìm theo mã drone hoặc trạng thái"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <div className="toolbar-group">
          <label>
            Sắp xếp
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="code">Mã</option>
              <option value="battery">Pin</option>
              <option value="dailyDeliveries">Đơn hôm nay</option>
              <option value="totalDeliveries">Tổng đơn</option>
              <option value="distance">Quãng đường</option>
            </select>
          </label>
          <button type="button" onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}>
            {sortDirection === 'asc' ? 'Tăng dần' : 'Giảm dần'}
          </button>
        </div>
        <button type="button" className="primary" onClick={openCreateDrone}>
          Thêm drone
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <p>Tổng drone</p>
          <h3>{drones.length}</h3>
        </div>
        <div className="stat-card">
          <p>Đang hoạt động</p>
          <h3>{totalActive}</h3>
        </div>
        <div className="stat-card">
          <p>Pin trung bình</p>
          <h3>{Math.round(totalBattery)}%</h3>
        </div>
        <div className="stat-card">
          <p>Tổng quãng đường</p>
          <h3>{totalDistance} km</h3>
        </div>
      </div>

      <DataTable columns={columns} data={filteredDrones} />

      {isModalOpen && (
        <Modal title={editingDroneId ? 'Cập nhật drone' : 'Thêm drone mới'} onClose={closeModal}>
          <form className="form" onSubmit={handleDroneSubmit}>
            <div className="grid two">
              <label>
                Mã drone
                <input name="code" value={droneForm.code} onChange={handleDroneChange} required />
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
                />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="ghost-button" onClick={closeModal}>
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

export default AdminDronesPage;
