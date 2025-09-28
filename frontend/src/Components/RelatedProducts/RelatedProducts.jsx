import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./RelatedProducts.css";
import Item from "../Item/Item";
import { ShopContext } from "../../Context/ShopContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const RelatedProducts = ({ currentProduct }) => {
  const { all_product } = useContext(ShopContext);
  const navigate = useNavigate();

  // Get current category in lowercase
  const currentCategory = currentProduct?.category
    ? (Array.isArray(currentProduct.category)
        ? currentProduct.category[0]
        : currentProduct.category
      ).toLowerCase()
    : "";

  // Filter products in the same category, excluding the current product
  const relatedProducts = all_product.filter(
    (product) =>
      product.category &&
      product.category.toLowerCase() === currentCategory &&
      product._id !== currentProduct._id
  );

  // Navigate to product page on click
  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="relatedproducts">
      <h1>Related Products</h1>
      <hr />

      <div className="relatedproducts-item">
        {relatedProducts.length > 0 ? (
          relatedProducts.map((item) => (
            <div
              key={item._id}
              className="product-card"
              onClick={() => handleProductClick(item._id)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={
                  Array.isArray(item.image) && item.image.length
                    ? item.image[0].startsWith("http")
                      ? item.image[0]
                      : `${API_BASE_URL}${item.image[0]}`
                    : `${API_BASE_URL}/uploads/default_product.jpg`
                }
                alt={item.name}
                className="product-image"
              />
              <h3>{item.name}</h3>
              <div className="price-container">
                <span className="new-price">LKR{item.new_price}</span>
                <span className="old-price">LKR{item.old_price}</span>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", marginTop: "30px" }}>
            No related products found.
          </p>
        )}
      </div>
    </div>
  );
};

export default RelatedProducts;