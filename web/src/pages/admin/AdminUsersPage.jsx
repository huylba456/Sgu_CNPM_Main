import { useMemo, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import Modal from '../../components/Modal.jsx';
import { useRestaurants } from '../../hooks/useRestaurants.js';

const roles = [
  { value: 'customer', label: 'Khách hàng' },
  { value: 'admin', label: 'Quản trị' },
  { value: 'restaurant', label: 'Nhà hàng' }
];

const defaultRestaurantImage = '/images/foodfast-placeholder.svg';

const AdminUsersPage = () => {
  const { users, setUserList } = useAuth();
  const { restaurants, addRestaurant } = useRestaurants();
  const [form, setForm] = useState({
    id: '',
    name: '',
    email: '',
    role: 'customer',
    phone: '',
    address: '',
    password: '',
    restaurantId: '',
    restaurantName: '',
    newRestaurantName: '',
    newRestaurantAddress: '',
    newRestaurantImage: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const filteredUsers = useMemo(() => {
    const keyword = searchTerm.toLowerCase();
    return users
      .filter(
        (user) =>
          !keyword ||
          user.name.toLowerCase().includes(keyword) ||
          user.email.toLowerCase().includes(keyword) ||
          (user.phone ?? '').toLowerCase().includes(keyword)
      )
      .sort((a, b) => {
        const direction = sortDirection === 'asc' ? 1 : -1;
        if (sortBy === 'name') return a.name.localeCompare(b.name) * direction;
        if (sortBy === 'email') return a.email.localeCompare(b.email) * direction;
        if (sortBy === 'role') return a.role.localeCompare(b.role) * direction;
        if (sortBy === 'status') return (a.status ?? 'active').localeCompare(b.status ?? 'active') * direction;
        return 0;
      });
  }, [users, searchTerm, sortBy, sortDirection]);

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
        header: 'Trạng thái',
        accessorKey: 'status',
        cell: ({ row }) => (row.original.status === 'inactive' ? 'Đã khóa' : 'Hoạt động')
      },
      {
        header: 'Hành động',
        cell: ({ row }) => (
          <div className="table-actions">
            <button type="button" onClick={() => toggleStatus(row.original)}>
              {row.original.status === 'inactive' ? 'Mở khóa' : 'Khóa'}
            </button>
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
    if (name === 'role' && value !== 'restaurant') {
      setForm((prev) => ({
        ...prev,
        role: value,
        restaurantId: '',
        restaurantName: '',
        newRestaurantName: '',
        newRestaurantAddress: '',
        newRestaurantImage: ''
      }));
      return;
    }

    setForm((prev) => {
      if (name === 'role' && value === 'restaurant') {
        const firstRestaurant = restaurants[0];
        const restaurantId = prev.restaurantId || firstRestaurant?.id || '';
        const restaurantName =
          prev.restaurantName || restaurants.find((item) => item.id === restaurantId)?.name || firstRestaurant?.name || '';

        return { ...prev, role: value, restaurantId, restaurantName, newRestaurantImage: '' };
      }
      if (name === 'restaurantId') {
        if (value === 'new') {
          return {
            ...prev,
            restaurantId: 'new',
            restaurantName: '',
            newRestaurantName: '',
            newRestaurantAddress: '',
            newRestaurantImage: ''
          };
        }
        const restaurant = restaurants.find((item) => item.id === value);
        return { ...prev, restaurantId: value, restaurantName: restaurant?.name ?? '', newRestaurantName: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleRestaurantImageChange = (event) => {
    const [file] = event.target.files;
    if (file) {
      setForm((prev) => ({ ...prev, newRestaurantImage: `/images/${file.name}` }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const status = editingId ? users.find((user) => user.id === editingId)?.status ?? 'active' : 'active';

    if (!editingId && !form.password.trim()) {
      return alert('Vui lòng nhập mật khẩu cho tài khoản mới.');
    }

    if (form.role === 'restaurant' && !form.restaurantId && !form.newRestaurantName.trim()) {
      return alert('Vui lòng chọn hoặc tạo nhà hàng cho tài khoản này.');
    }

    const password = form.password.trim();
    if (editingId) {
      setUserList((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...form,
                password: password || item.password,
                status,
                address: form.address || item.address
              }
            : item
        )
      );
    } else {
      let restaurantId = form.restaurantId;
      let restaurantName = form.restaurantName;

      if (form.role === 'restaurant' && (restaurantId === 'new' || !restaurantId)) {
        const created = addRestaurant({
          name: form.newRestaurantName || form.restaurantName,
          address: form.newRestaurantAddress,
          image: form.newRestaurantImage || defaultRestaurantImage
        });
        restaurantId = created.id;
        restaurantName = created.name;
      }

      const selectedRestaurant = restaurants.find((item) => item.id === restaurantId);
      const newUser = {
        ...form,
        id: crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 11),
        status,
        password,
        restaurantId: restaurantId || selectedRestaurant?.id || '',
        restaurantName: restaurantName || selectedRestaurant?.name || '',
        address: form.address || selectedRestaurant?.address || ''
      };
      setUserList((prev) => [...prev, newUser]);
    }
    closeModal();
  };

  function handleEdit(user) {
    setForm({
      ...user,
      password: '',
      restaurantId: user.restaurantId ?? '',
      restaurantName: user.restaurantName ?? '',
      newRestaurantName: '',
      newRestaurantAddress: '',
      newRestaurantImage: ''
    });
    setEditingId(user.id);
    setIsModalOpen(true);
  }

  function promptDelete(user) {
    setUserToDelete(user);
  }

  const handleDelete = () => {
    if (!userToDelete) return;
    setUserList((prev) => prev.filter((item) => item.id !== userToDelete.id));
    if (editingId === userToDelete.id) {
      setEditingId(null);
      resetForm();
    }
    setUserToDelete(null);
  };

  const resetForm = () =>
    setForm({
      id: '',
      name: '',
      email: '',
      role: 'customer',
      phone: '',
      address: '',
      password: '',
      restaurantId: '',
      restaurantName: '',
      newRestaurantName: '',
      newRestaurantAddress: '',
      newRestaurantImage: ''
    });

  const closeModal = () => {
    resetForm();
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  function toggleStatus(user) {
    setUserList((prev) =>
      prev.map((item) =>
        item.id === user.id ? { ...item, status: item.status === 'inactive' ? 'active' : 'inactive' } : item
      )
    );
  }

  return (
    <div className="page dashboard">
      <h2>Quản lý người dùng</h2>
      <div className="toolbar">
        <input
          type="search"
          placeholder="Tìm theo tên, email hoặc SĐT"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <div className="toolbar-group">
          <label>
            Sắp xếp
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="name">Tên</option>
              <option value="email">Email</option>
              <option value="role">Vai trò</option>
              <option value="status">Trạng thái</option>
            </select>
          </label>
          <button type="button" onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}>
            {sortDirection === 'asc' ? 'Tăng dần' : 'Giảm dần'}
          </button>
        </div>
        <button type="button" className="primary" onClick={handleCreate}>
          Thêm người dùng
        </button>
      </div>
      <DataTable columns={columns} data={filteredUsers} />
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
            {form.role === 'restaurant' ? (
              <>
                <label className="form-field">
                  Nhà hàng phụ trách
                  <select
                    name="restaurantId"
                    value={form.restaurantId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Chọn nhà hàng --</option>
                    <option value="new">+ Thêm nhà hàng mới</option>
                    {restaurants.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                {form.restaurantId === 'new' ? (
                  <>
                    <label className="form-field">
                      Tên nhà hàng mới
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
                        <label htmlFor="admin-restaurant-image" className="upload-button">
                          Upload
                        </label>
                        <span>{form.newRestaurantImage ? form.newRestaurantImage.split('/').pop() : 'Chưa có tệp'}</span>
                        <input
                          id="admin-restaurant-image"
                          type="file"
                          accept="image/*"
                          onChange={handleRestaurantImageChange}
                        />
                      </div>
                    </label>
                  </>
                ) : null}
              </>
            ) : null}
            <label className="form-field">
              Mật khẩu {editingId ? '(để trống nếu giữ nguyên)' : ''}
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required={!editingId}
              />
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
