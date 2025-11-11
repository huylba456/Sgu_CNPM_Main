import { useMemo, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import { users as seedUsers } from '../../data/mockUsers.js';
import Modal from '../../components/Modal.jsx';

const roles = [
  { value: 'customer', label: 'Khách hàng' },
  { value: 'admin', label: 'Quản trị' },
  { value: 'restaurant', label: 'Nhà hàng' }
];

const AdminUsersPage = () => {
  const [users, setUsers] = useState(seedUsers);
  const [form, setForm] = useState({
    id: '',
    name: '',
    email: '',
    role: 'customer',
    phone: '',
    address: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const columns = useMemo(
    () => [
      { header: 'Tên', accessorKey: 'name' },
      { header: 'Email', accessorKey: 'email' },
      {
        header: 'Vai trò',
        accessorKey: 'role',
        cell: ({ row }) => roles.find((role) => role.value === row.original.role)?.label ?? row.original.role
      },
      { header: 'SĐT', accessorKey: 'phone' },
      { header: 'Địa chỉ', accessorKey: 'address' },
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
    [users]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (editingId) {
      setUsers((prev) => prev.map((item) => (item.id === editingId ? { ...item, ...form } : item)));
    } else {
      setUsers((prev) => [...prev, { ...form, id: crypto.randomUUID() }]);
    }
    closeModal();
  };

  const handleEdit = (user) => {
    setForm({ ...user });
    setEditingId(user.id);
    setIsModalOpen(true);
  };

  const promptDelete = (user) => {
    setUserToDelete(user);
  };

  const handleDelete = () => {
    if (!userToDelete) return;
    setUsers((prev) => prev.filter((item) => item.id !== userToDelete.id));
    if (editingId === userToDelete.id) {
      setEditingId(null);
      resetForm();
    }
    setUserToDelete(null);
  };

  const resetForm = () =>
    setForm({ id: '', name: '', email: '', role: 'customer', phone: '', address: '' });

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
      <h2>Quản lý người dùng</h2>
      <div className="toolbar">
        <button type="button" className="primary" onClick={handleCreate}>
          Thêm người dùng
        </button>
      </div>
      <DataTable columns={columns} data={users} />
      {isModalOpen && (
        <Modal title={editingId ? 'Cập nhật người dùng' : 'Thêm người dùng'} onClose={closeModal}>
          <form className="form" onSubmit={handleSubmit}>
            <div className="grid two form-grid">
              <label className="form-field">
                Họ tên
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>
              <label className="form-field">
                Email
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </label>
              <label className="form-field">
                Vai trò
                <select name="role" value={form.role} onChange={handleChange}>
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                Số điện thoại
                <input name="phone" value={form.phone} onChange={handleChange} />
              </label>
            </div>
            <label className="form-field">
              Địa chỉ
              <input name="address" value={form.address} onChange={handleChange} />
            </label>
            <div className="modal-actions">
              <button type="button" className="ghost-button" onClick={closeModal}>
                Hủy
              </button>
              <button type="submit" className="primary">
                {editingId ? 'Lưu thay đổi' : 'Thêm người dùng'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {userToDelete && (
        <Modal title="Xóa người dùng" onClose={() => setUserToDelete(null)}>
          <p>
            Bạn có chắc chắn muốn xóa <strong>{userToDelete.name}</strong> không?
          </p>
          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={() => setUserToDelete(null)}>
              Không
            </button>
            <button type="button" className="danger" onClick={handleDelete}>
              Có, xóa người dùng
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminUsersPage;
