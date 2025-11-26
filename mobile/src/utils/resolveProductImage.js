const productImageMap = {
  'Burger_Wagyu_Signature.jpeg': require('../../public/images/Burger_Wagyu_Signature.jpeg'),
  'Combo_Sushi_Thuong_Hang.jpg': require('../../public/images/Combo_Sushi_Thuong_Hang.jpg'),
  'Pizza_Pesto.jpg': require('../../public/images/Pizza_Pesto.jpg'),
  'Salad_Detox.jpg': require('../../public/images/Salad_Detox.jpg'),
  'Tiramisu_Espresso.jpg': require('../../public/images/Tiramisu_Espresso.jpg'),
  'Burger_Ga.jpg': require('../../public/images/Burger_Ga.jpg'),
  'Set_Sushi_Chay.jpg': require('../../public/images/Set_Sushi_Chay.jpg'),
  'Pasta_Hai_San.jpg': require('../../public/images/Pasta_Hai_San.jpg'),
  'Hoahong_Matong.jpg': require('../../public/images/Hoahong_Matong.jpg'),
  'Pizza_Margherita.jpeg': require('../../public/images/Pizza_Margherita.jpeg'),
  'SmoothieXoai.jpg': require('../../public/images/SmoothieXoai.jpg'),
  'CheeseCake.jpg': require('../../public/images/CheeseCake.jpg'),
  'foodfast-placeholder.svg': require('../../public/images/CheeseCake.jpg')
};

const placeholderImage = productImageMap['foodfast-placeholder.svg'];

const normalizeKey = (image) => {
  if (typeof image !== 'string') return '';
  const cleaned = image.split('?')[0];
  const parts = cleaned.split('/');
  return parts[parts.length - 1] || cleaned;
};

export const resolveProductImage = (image) => {
  if (!image) {
    return placeholderImage;
  }

  if (typeof image === 'string') {
    if (image.startsWith('http')) {
      return { uri: image };
    }

    const normalizedKey = normalizeKey(image);
    if (productImageMap[normalizedKey]) {
      return productImageMap[normalizedKey];
    }
  }

  return typeof image === 'number' ? image : placeholderImage;
};

export const PRODUCT_IMAGE_MAP = productImageMap;
