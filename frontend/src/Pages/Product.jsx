import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import Breadcrum from '../Components/Breadcrums/Breadcrum';
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay';
import DescriptionBox from '../Components/DescriptionBox/DescriptionBox';
import RelatedProducts from '../Components/RelatedProducts/RelatedProducts';

const Product = () => {
  const { all_product } = useContext(ShopContext);
  const { productId } = useParams();

  if (all_product.length === 0) {
    return <div>Loading product...</div>;
  }

  // Make sure to compare _id or id properly
  const product = all_product.find((e) => e._id === productId || e.id === productId);

  if (!product) {
    return <div>Product not found.</div>;
  }

  return (
    <div>
      <Breadcrum product={product} />
      <ProductDisplay product={product} />

      <RelatedProducts currentProduct={product} />
    </div>
  );
};

export default Product;
