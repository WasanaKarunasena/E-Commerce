// FRONTEND: ShopCategory.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import './CSS/ShopCategory.css';
import Item from '../Components/Item/Item';
import SearchBar from '../Components/SearchBar';
import { ShopContext } from '../Context/ShopContext';
import { useLocation } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ShopCategory = () => {
  const { all_product, loading } = useContext(ShopContext);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/categories/public`);
        setCategories(res.data || []);
      } catch (err) {
        console.error('Fetch categories failed:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length) {
      const path = location.pathname.slice(1); // remove leading slash
      const match = categories.find(
        c => c.name.toLowerCase().replace(/\s+/g, '-') === path
      );
      setSelectedCategory(match ? match.name : categories[0].name);
    }
  }, [categories, location.pathname]);

  const products = all_product.filter(product =>
    product.category &&
    product.category.toLowerCase() === selectedCategory.toLowerCase() &&
    (!searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <p style={{ textAlign: 'center' }}>Loading...</p>;
  }

  const bannerObj = categories.find(c => c.name === selectedCategory);
  const bannerSrc = bannerObj && bannerObj.bannerURL
    ? bannerObj.bannerURL.startsWith('http')
      ? bannerObj.bannerURL
      : `${API_BASE_URL}${bannerObj.bannerURL}`
    : `${API_BASE_URL}/uploads/default_banner.png`;

  return (
    <div className="shop-category">
      {/* Banner only, no category name above */}
      <img className="shopcategory-banner" src={bannerSrc} alt="" />

      <div className="shopcategory-search">
        <SearchBar onSearch={setSearchTerm} suggestions={[]} />
      </div>

      <div className="shopcategory-products">
        {products.length ? (
          products.map(item => (
            <Item
              key={item._id}
              id={item._id}
              image={
                Array.isArray(item.image) && item.image.length
                  ? (item.image[0].startsWith('http')
                    ? item.image[0]
                    : `${API_BASE_URL}${item.image[0]}`)
                  : `${API_BASE_URL}/uploads/default_product.jpg`
              }
              name={item.name}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))
        ) : (
          <p style={{ textAlign: 'center', marginTop: '30px' }}>
            No products found.
          </p>
        )}
      </div>
    </div>
  );
};
export default ShopCategory;