// src/pages/Shop.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Hero from '../Components/Hero/Hero';
import Offers from '../Components/Offers/Offers';
import NewCollections from '../Components/NewCollections/NewCollections';
import NewsLetter from '../Components/NewsLetter/NewsLetter';
import SearchBar from '../Components/SearchBar';
import ProductGrid from '../Components/ProductGrid';

const Shop = () => {
  const [items, setItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Fetch all products for suggestions
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/items`);
        const data = res.data || [];
        setAllProducts(data);
        const names = data.map(item => item.name);
        setSuggestions(names);
      } catch (err) {
        console.error('Error fetching product list:', err);
      }
    };

    fetchAllProducts();
  }, [BASE_URL]);

  const handleSearch = (query) => {
    if (!query) return;

    setSearchPerformed(true);

    axios
      .get(`${BASE_URL}/items/search?query=${query}`)
      .then((res) => {
        setItems(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error('Search error:', err);
        setItems([]);
      });
  };

  return (
    <div>
      <SearchBar onSearch={handleSearch} suggestions={suggestions} />

      {searchPerformed && (
        <div style={{ padding: '20px' }}>
          <h2>Search Results</h2>
          {items.length > 0 ? (
            <ProductGrid items={items} />
          ) : (
            <p style={{ textAlign: 'center', fontSize: '18px', marginTop: '20px' }}>
              ❌ No matching products found.
            </p>
          )}
        </div>
      )}

      <Hero />
      <Offers />
      <NewCollections />
      <NewsLetter />
    </div>
  );
};

export default Shop;
