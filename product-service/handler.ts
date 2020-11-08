import 'source-map-support/register';

import { getProductsList } from './src/handlers/getProductsList';
import { getProductById } from './src/handlers/getProductById';
import { createProduct } from './src/handlers/createProduct';

export {
  getProductsList,
  getProductById,
  createProduct,
}
