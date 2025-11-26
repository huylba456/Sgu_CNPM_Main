import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import { colors, spacing, typography } from '../../styles/theme';
import { useOrders } from '../../hooks/useOrders';

const droneStatusOptions = ['Hoạt động', 'Đang bảo trì', 'Đang sạc', 'Không khả dụng'];

const AdminDronesScreen = () => {
  const { drones, addDrone, updateDrone, deleteDrone } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('code');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    id: '',
    status: droneStatusOptions[0],
    battery: '100',
    dailyDeliveries: '0',
    totalDeliveries: '0',
    distance: '0'
  });

  const resetForm = () => {
    setForm({ id: '', status: droneStatusOptions[0], battery: '100', dailyDeliveries: '0', totalDeliveries: '0', distance: '0' });
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!form.id.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mã drone.');
      return;
    }

    const payload = {
      code: form.id.trim(),
      status: form.status,
      battery: Number(form.battery),
      dailyDeliveries: Number(form.dailyDeliveries),
      totalDeliveries: Number(form.totalDeliveries),
      distance: Number(form.distance)
    };

    if (editingId) {
      updateDrone(editingId, payload);
    } else {
      addDrone(payload);
    }
    resetForm();
  };

  const handleEdit = (drone) => {
    setForm({
      id: drone.code ?? drone.id,
      status: drone.status,
      battery: String(drone.battery),
      dailyDeliveries: String(drone.dailyDeliveries),
      totalDeliveries: String(drone.totalDeliveries),
      distance: String(drone.distance)
    });
    setEditingId(drone.id);
  };

  const handleDelete = (drone) => {
    Alert.alert('Xóa drone', `Bạn có chắc chắn muốn xóa ${drone.code ?? drone.id}?`, [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => deleteDrone(drone.id)
      }
    ]);
  };

  const filtered = drones
    .filter((drone) => {
      const keyword = searchTerm.toLowerCase();
      return (
        !keyword ||
        (drone.code ?? drone.id).toLowerCase().includes(keyword) ||
        drone.status.toLowerCase().includes(keyword)
      );
    })
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      if (sortKey === 'code') {
        return (a.code ?? a.id).localeCompare(b.code ?? b.id) * direction;
      }
      if (sortKey === 'battery') {
        return (a.battery - b.battery) * direction;
      }
      if (sortKey === 'dailyDeliveries') {
        return (a.dailyDeliveries - b.dailyDeliveries) * direction;
      }
      return 0;
    });

  return (
    <Screen>
      <AppHeader title="Đội drone" subtitle="Theo dõi trạng thái và hiệu suất drone giao hàng." />

      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>{editingId ? 'Cập nhật drone' : 'Thêm drone mới'}</Text>
        <TextInput
          style={styles.input}
          placeholder="Mã drone"
          placeholderTextColor={colors.textMuted}
          value={form.id}
          onChangeText={(value) => setForm((prev) => ({ ...prev, id: value }))}
        />
        <View style={styles.categoryRow}>
          {droneStatusOptions.map((status) => (
            <Chip
              key={status}
              label={status}
              active={form.status === status}
              onPress={() => setForm((prev) => ({ ...prev, status }))}
            />
          ))}
        </View>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Pin (%)"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={form.battery}
            onChangeText={(value) => setForm((prev) => ({ ...prev, battery: value }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Đơn hôm nay"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={form.dailyDeliveries}
            onChangeText={(value) => setForm((prev) => ({ ...prev, dailyDeliveries: value }))}
          />
        </View>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Tổng đơn"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={form.totalDeliveries}
            onChangeText={(value) => setForm((prev) => ({ ...prev, totalDeliveries: value }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Quãng đường (km)"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={form.distance}
            onChangeText={(value) => setForm((prev) => ({ ...prev, distance: value }))}
          />
        </View>
        <Button label={editingId ? 'Lưu thay đổi' : 'Thêm drone'} onPress={handleSubmit} />
        {editingId ? <Button label="Hủy" variant="ghost" onPress={resetForm} /> : null}
      </Card>

      <Card style={styles.listCard}>
        <Text style={styles.sectionTitle}>Danh sách drone</Text>
        <TextInput
          style={styles.input}
          placeholder="Tìm theo mã hoặc tình trạng"
          placeholderTextColor={colors.textMuted}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <View style={styles.categoryRow}>
          <Text style={styles.label}>Sắp xếp theo:</Text>
          <Chip label="Mã" active={sortKey === 'code'} onPress={() => setSortKey('code')} />
          <Chip label="Pin" active={sortKey === 'battery'} onPress={() => setSortKey('battery')} />
          <Chip
            label="Đơn hôm nay"
            active={sortKey === 'dailyDeliveries'}
            onPress={() => setSortKey('dailyDeliveries')}
          />
          <Button
            label={sortDirection === 'asc' ? 'Tăng dần' : 'Giảm dần'}
            variant="ghost"
            onPress={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          />
        </View>
        {filtered.map((drone) => (
          <View key={drone.id} style={styles.droneRow}>
            <View style={styles.droneInfo}>
              <Text style={styles.droneId}>{drone.code ?? drone.id}</Text>
              <Text style={styles.metaText}>{drone.status}</Text>
              <Text style={styles.metaText}>Pin: {drone.battery}% • Đơn hôm nay: {drone.dailyDeliveries}</Text>
              <Text style={styles.metaText}>Tổng đơn: {drone.totalDeliveries} • Quãng đường: {drone.distance} km</Text>
            </View>
            <View style={styles.actions}>
              <Button label="Sửa" variant="ghost" onPress={() => handleEdit(drone)} />
              <Button label="Xóa" variant="ghost" onPress={() => handleDelete(drone)} />
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  formCard: {
    gap: spacing.md
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.surface
  },
  label: {
    color: colors.textMuted
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  listCard: {
    gap: spacing.md
  },
  droneRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  droneInfo: {
    flex: 1,
    gap: spacing.xs
  },
  droneId: {
    color: colors.text,
    fontWeight: '600'
  },
  metaText: {
    color: colors.textMuted
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  }
});

export default AdminDronesScreen;
