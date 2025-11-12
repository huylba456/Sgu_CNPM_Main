import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import { colors, spacing, typography } from '../../styles/theme';
import { drones as seedDrones, droneStatusOptions } from '../../data/mockDrones';

const AdminDronesScreen = () => {
  const [drones, setDrones] = useState(seedDrones);
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
      id: form.id.trim(),
      status: form.status,
      battery: Number(form.battery),
      dailyDeliveries: Number(form.dailyDeliveries),
      totalDeliveries: Number(form.totalDeliveries),
      distance: Number(form.distance)
    };

    setDrones((prev) => {
      if (editingId) {
        return prev.map((drone) => (drone.id === editingId ? payload : drone));
      }
      return [...prev, payload];
    });
    resetForm();
  };

  const handleEdit = (drone) => {
    setForm({
      id: drone.id,
      status: drone.status,
      battery: String(drone.battery),
      dailyDeliveries: String(drone.dailyDeliveries),
      totalDeliveries: String(drone.totalDeliveries),
      distance: String(drone.distance)
    });
    setEditingId(drone.id);
  };

  const handleDelete = (drone) => {
    Alert.alert('Xóa drone', `Bạn có chắc chắn muốn xóa ${drone.id}?`, [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => setDrones((prev) => prev.filter((item) => item.id !== drone.id))
      }
    ]);
  };

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
        {drones.map((drone) => (
          <View key={drone.id} style={styles.droneRow}>
            <View style={styles.droneInfo}>
              <Text style={styles.droneId}>{drone.id}</Text>
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
    gap: spacing.sm
  }
});

export default AdminDronesScreen;
