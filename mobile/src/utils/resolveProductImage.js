const productImageMap = {
  'mobile/public/images/Burger_Wagyu_Signature.jpeg': require('../../public/images/Burger_Wagyu_Signature.jpeg'),
  'mobile/public/images/Combo_Sushi_Thuong_Hang.jpg': require('../../public/images/Combo_Sushi_Thuong_Hang.jpg'),
  'mobile/public/images/Pizza_Pesto.jpg': require('../../public/images/Pizza_Pesto.jpg'),
  'mobile/public/images/Salad_Detox.jpg': require('../../public/images/Salad_Detox.jpg'),
  'mobile/public/images/Tiramisu_Espresso.jpg': require('../../public/images/Tiramisu_Espresso.jpg'),
  'mobile/public/images/Burger_Ga.jpg': require('../../public/images/Burger_Ga.jpg'),
  'mobile/public/images/Set_Sushi_Chay.jpg': require('../../public/images/Set_Sushi_Chay.jpg'),
  'mobile/public/images/Pasta_Hai_San.jpg': require('../../public/images/Pasta_Hai_San.jpg'),
  'mobile/public/images/Hoahong_Matong.jpg': require('../../public/images/Hoahong_Matong.jpg'),
  'mobile/public/images/Pizza_Margherita.jpeg': require('../../public/images/Pizza_Margherita.jpeg'),
  'mobile/public/images/SmoothieXoai.jpg': require('../../public/images/SmoothieXoai.jpg'),
  'mobile/public/images/CheeseCake.jpg': require('../../public/images/CheeseCake.jpg')
};

const placeholderImage = productImageMap['mobile/public/images/Burger_Wagyu_Signature.jpeg'];

export const resolveProductImage = (image) => {
  if (!image) {
    return placeholderImage;
  }

  if (typeof image === 'string') {
    if (image.startsWith('http')) {
      return { uri: image };
    }

    if (productImageMap[image]) {
      return productImageMap[image];
    }
  }

  return typeof image === 'number' ? image : placeholderImage;
};

export const PRODUCT_IMAGE_MAP = productImageMap;
