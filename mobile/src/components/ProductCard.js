import { useNavigation } from '@react-navigation/native';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import Card from './Card';
import Button from './Button';
import Stack from './Stack';
import { colors, radius, spacing, typography } from '../styles/theme';
import { resolveProductImage } from '../utils/resolveProductImage';

const ProductCard = ({ product }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const isGuest = !user;
  const imageSource = resolveProductImage(product.image);

  return (
    <Card>
      <Stack gap={spacing.md}>
        <View style={styles.imageWrapper}>
          <Image source={imageSource} style={styles.image} resizeMode="cover" />
        </View>
        <Stack gap={spacing.xs}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.restaurant}>{product.restaurant}</Text>
          <Text style={styles.description}>{product.description}</Text>
          <Stack gap={spacing.sm}>
            <Text style={styles.price}>{product.price.toLocaleString('vi-VN')} đ</Text>
            <Stack direction="row" gap={spacing.sm} wrap>
              <Button
                label="Chi tiết"
                variant="ghost"
                onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
              />
              <Button
                label="Thêm"
                onPress={() => addToCart(product)}
                disabled={isGuest}
                style={styles.addButton}
              />
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 160
  },
  imageWrapper: {
    alignSelf: 'stretch',
    borderRadius: radius.md,
    overflow: 'hidden'
  },
  name: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '600'
  },
  restaurant: {
    color: colors.textMuted,
    fontSize: typography.small
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.small
  },
  price: {
    color: colors.accent,
    fontSize: typography.subtitle,
    fontWeight: '700'
  },
  addButton: {
    flex: 1
  }
});

export default ProductCard;
