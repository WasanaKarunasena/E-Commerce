import React, { useState, useEffect } from "react";
import axios from "axios";

import Navbar from "./Components/Navbar/Navbar";
import Admin from "./Pages/Admin/Admin";
import Loader from "./Components/Loader/Loader"; 

const App = () => {
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const reqInterceptor = axios.interceptors.request.use((config) => {
      setLoading(true);
      return config;
    });

    const resInterceptor = axios.interceptors.response.use(
      (res) => {
        setLoading(false);
        return res;
      },
      (err) => {
        setLoading(false);
        return Promise.reject(err);
      }
    );

    
    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, []);

  return (
    <div>
      <Navbar />
      {loading && <Loader />} {/* ✅ Show loader while any request is in progress */}
      <Admin />
    </div>
  );
};

export default App;
