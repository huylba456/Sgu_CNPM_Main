import { useAuth } from '../hooks/useAuth.js';

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2>Xin chào {user.name}</h2>
        <p className="muted">Bạn đã đăng nhập thành công. Hồ sơ chi tiết sẽ được bổ sung ở giai đoạn sau.</p>
      </header>
    </div>
  );
};

export default ProfilePage;
