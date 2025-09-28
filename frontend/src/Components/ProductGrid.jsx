import React, { useState } from 'react';
import './ProductGrid.css';
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay'; // Assuming same folder
import RelatedProducts from '../Components/RelatedProducts/RelatedProducts'; // Assuming same folder

const ProductGrid = ({ items }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  return (
    <div>
      {selectedProduct ? (
        <div>
          <ProductDisplay product={selectedProduct} />
          <RelatedProducts currentProduct={selectedProduct} />
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button onClick={() => setSelectedProduct(null)}>← Back to Results</button>
          </div>
        </div>
      ) : (
        <div className="product-grid">
          {items.map((item) => (
            <div key={item._id} className="product-card" onClick={() => handleProductClick(item)}>
              <img src={item.image[0]} alt={item.name} />
              <h4>{item.name}</h4>
              <p>{item.new_price} LKR</p>
              <p>{item.category}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
