import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';

import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import Loader from './Components/Loader/Loader'; 

import Shop from './Pages/Shop';
import ShopCategory from './Pages/ShopCategory';
import LoginSignup from './Pages/LoginSignup';
import Product from './Pages/Product';
import Cart from './Pages/Cart';

import OrderForm from './Components/OrderForm';
import CustomerOrders from './Components/CustomerOrders';
import AdminOrders from './Components/AdminOrders';
import OrderDetails from './Components/OrderDetails';
import Success from './Components/Success';
import Cancel from './Components/Cancel';
import ScrollToTop from './Components/ScrollToTop';

import ShopContextProvider, { ShopContext } from './Context/ShopContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function AppRoutes() {
  const { all_product } = useContext(ShopContext);
  const [categories, setCategories] = useState([]);
  const [categoryBanners, setCategoryBanners] = useState({});

  useEffect(() => {
    // Fetch category list
    axios
      .get(`${API_BASE_URL}/categories/public`)
      .then((res) => setCategories(res.data || []))
      .catch((err) => console.error('Failed to load categories', err));

    // Fetch banners
    axios
      .get(`${API_BASE_URL}/content/Categories`)
      .then((res) => setCategoryBanners(res.data.data || {}))
      .catch((err) =>
        console.error('Failed to load category banners. Using default:', err)
      );
  }, []);

  return (
    <Routes>
      <Route path='/' element={<Shop />} />

      {/* Dynamic category routes */}
      {categories.map((cat) => {
        const routePath = `/${cat.name.toLowerCase().replace(/\s+/g, '-')}`;
        const bannerKey = `${cat.name.toLowerCase()}_banner`;
        const bannerUrl = `${API_BASE_URL}${categoryBanners[bannerKey] || '/uploads/default.png'}`;

        return (
          <Route
            key={cat._id}
            path={routePath}
            element={
              <ShopCategory
                banner={bannerUrl}
                category={cat.name.toLowerCase()}
              />
            }
          />
        );
      })}

      <Route path='/product/:productId' element={<Product />} />
      <Route path='/cart' element={<Cart />} />
      <Route path='/login' element={<LoginSignup />} />

      <Route path='/order/new' element={<OrderForm />} />
      <Route path='/orders' element={<CustomerOrders />} />
      <Route path='/admin/orders' element={<AdminOrders />} />
      <Route path='/order/:id' element={<OrderDetails />} />
      <Route path='/order-now' element={<OrderForm />} />

      <Route path='/payments/success' element={<Success />} />
      <Route path='/payments/cancel' element={<Cancel />} />
    </Routes>
  );
}

function App() {
  const [loading, setLoading] = useState(false);

  // ✅ Setup Axios interceptors for global loader
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use((config) => {
      setLoading(true);
      return config;
    });

    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        setLoading(false);
        return response;
      },
      (error) => {
        setLoading(false);
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return (
    <ShopContextProvider>
      <Router>
        <ScrollToTop />
        <Navbar />
        {loading && <Loader />} {/* ✅ Show loader while loading */}
        <AppRoutes />
        <Footer />
      </Router>
    </ShopContextProvider>
  );
}

export default App;
