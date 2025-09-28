import React, { useState, useEffect } from "react";
import axios from "axios";
import Notification from "../Notification/Notification"; // Adjust import path as needed
import "./AdminCatalogManager.css";

const AdminCatalogManager = () => {
  // State for forms
  const [categoryData, setCategoryData] = useState({ name: "", description: "" });
  const [subCategoryData, setSubCategoryData] = useState({ name: "", description: "", categoryId: "" });
  const [brandData, setBrandData] = useState({ name: "", description: "", logoUrl: "", website: "" });

  // Data lists
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Notification state
  const [notification, setNotification] = useState({ type: "", message: "" });

  // Editing states
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryData, setEditingCategoryData] = useState({ name: "", description: "" });

  const [editingSubCategoryId, setEditingSubCategoryId] = useState(null);
  const [editingSubCategoryData, setEditingSubCategoryData] = useState({ name: "", description: "", categoryId: "" });

  const [editingBrandId, setEditingBrandId] = useState(null);
  const [editingBrandData, setEditingBrandData] = useState({ name: "", description: "", logoUrl: "", website: "" });

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Fetch all data
  const fetchData = async () => {
    try {
      const [catRes, subCatRes, brandRes] = await Promise.all([
        axios.get(`${BASE_URL}/categories`, axiosConfig),
        axios.get(`${BASE_URL}/sub-categories`, axiosConfig),
        axios.get(`${BASE_URL}/brands`, axiosConfig),
      ]);
      setCategories(catRes.data);
      setSubCategories(subCatRes.data);
      setBrands(brandRes.data);
    } catch (err) {
      setNotification({ type: "error", message: "Failed to load data" });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Category Handlers
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setNotification({ type: "", message: "" });
    try {
      await axios.post(`${BASE_URL}/categories`, categoryData, axiosConfig);
      setCategoryData({ name: "", description: "" });
      setNotification({ type: "success", message: "Category added successfully!" });
      fetchData();
    } catch (err) {
      setNotification({ type: "error", message: err.response?.data?.error || "Failed to add category" });
    }
  };

  const handleCategoryUpdate = async (id) => {
    setNotification({ type: "", message: "" });
    try {
      await axios.put(`${BASE_URL}/categories/${id}`, editingCategoryData, axiosConfig);
      setEditingCategoryId(null);
      setNotification({ type: "success", message: "Category updated successfully!" });
      fetchData();
    } catch (err) {
      setNotification({ type: "error", message: err.response?.data?.error || "Failed to update category" });
    }
  };

  const handleCategoryDelete = async (id) => {
    setNotification({ type: "", message: "" });
    try {
      await axios.delete(`${BASE_URL}/categories/${id}`, axiosConfig);
      setNotification({ type: "success", message: "Category deleted successfully!" });
      fetchData();
    } catch (err) {
      setNotification({ type: "error", message: err.response?.data?.error || "Failed to delete category" });
    }
  };

  // Subcategory Handlers
  const handleSubCategorySubmit = async (e) => {
    e.preventDefault();
    setNotification({ type: "", message: "" });
    try {
      await axios.post(`${BASE_URL}/sub-categories`, subCategoryData, axiosConfig);
      setSubCategoryData({ name: "", description: "", categoryId: "" });
      setNotification({ type: "success", message: "Subcategory added successfully!" });
      fetchData();
    } catch (err) {
      setNotification({ type: "error", message: err.response?.data?.error || "Failed to add subcategory" });
    }
  };

  const handleSubCategoryUpdate = async (id) => {
    setNotification({ type: "", message: "" });
    try {
      await axios.put(`${BASE_URL}/sub-categories/${id}`, editingSubCategoryData, axiosConfig);
      setEditingSubCategoryId(null);
      setNotification({ type: "success", message: "Subcategory updated successfully!" });
      fetchData();
    } catch (err) {
      setNotification({ type: "error", message: err.response?.data?.error || "Failed to update subcategory" });
    }
  };

  const handleSubCategoryDelete = async (id) => {
    setNotification({ type: "", message: "" });
    try {
      await axios.delete(`${BASE_URL}/sub-categories/${id}`, axiosConfig);
      setNotification({ type: "success", message: "Subcategory deleted successfully!" });
      fetchData();
    } catch (err) {
      setNotification({ type: "error", message: err.response?.data?.error || "Failed to delete subcategory" });
    }
  };

  // Brand Handlers
  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    setNotification({ type: "", message: "" });
    if (!brandData.name || !brandData.logoUrl) {
      setNotification({ type: "error", message: "Brand name and logo URL are required" });
      return;
    }
    try {
      await axios.post(`${BASE_URL}/brands`, brandData, axiosConfig);
      setBrandData({ name: "", description: "", logoUrl: "", website: "" });
      setNotification({ type: "success", message: "Brand added successfully!" });
      fetchData();
    } catch (err) {
      setNotification({ type: "error", message: err.response?.data?.error || "Failed to add brand" });
    }
  };

  const handleBrandUpdate = async (id) => {
    setNotification({ type: "", message: "" });
    if (!editingBrandData.name) {
      setNotification({ type: "error", message: "Brand name is required" });
      return;
    }
    try {
      await axios.put(`${BASE_URL}/brands/${id}`, editingBrandData, axiosConfig);
      setEditingBrandId(null);
      setNotification({ type: "success", message: "Brand updated successfully!" });
      fetchData();
    } catch (err) {
      setNotification({ type: "error", message: err.response?.data?.error || "Failed to update brand" });
    }
  };

  const handleBrandDelete = async (id) => {
    setNotification({ type: "", message: "" });
    try {
      await axios.delete(`${BASE_URL}/brands/${id}`, axiosConfig);
      setNotification({ type: "success", message: "Brand deleted successfully!" });
      fetchData();
    } catch (err) {
      setNotification({ type: "error", message: err.response?.data?.error || "Failed to delete brand" });
    }
  };

  return (
    <div className="admin-catalog-manager">
      <h2>Manage Catalog</h2>

      {notification.message && <Notification type={notification.type} message={notification.message} />}

      {/* Add Category */}
      <form onSubmit={handleCategorySubmit}>
        <h3>Add Category</h3>
        <input
          type="text"
          placeholder="Name"
          value={categoryData.name}
          onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          value={categoryData.description}
          onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
        />
        <button type="submit">Add Category</button>
      </form>

      {/* Categories Table */}
      <h4>Existing Categories</h4>
      <table>
        <thead>
          <tr><th>Name</th><th>Description</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {categories.length === 0 && (
            <tr><td colSpan="3">No categories found.</td></tr>
          )}
          {categories.map((cat) => (
            <tr key={cat._id}>
              {editingCategoryId === cat._id ? (
                <>
                  <td>
                    <input
                      type="text"
                      value={editingCategoryData.name}
                      onChange={(e) => setEditingCategoryData({ ...editingCategoryData, name: e.target.value })}
                      required
                    />
                  </td>
                  <td>
                    <textarea
                      value={editingCategoryData.description}
                      onChange={(e) => setEditingCategoryData({ ...editingCategoryData, description: e.target.value })}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleCategoryUpdate(cat._id)}>Save</button>
                    <button onClick={() => setEditingCategoryId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{cat.name}</td>
                  <td>{cat.description || "-"}</td>
                  <td>
                    <button
                      onClick={() => {
                        setEditingCategoryId(cat._id);
                        setEditingCategoryData({ name: cat.name, description: cat.description || "" });
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleCategoryDelete(cat._id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Subcategory */}
      <form onSubmit={handleSubCategorySubmit}>
        <h3>Add Subcategory</h3>
        <input
          type="text"
          placeholder="Name"
          value={subCategoryData.name}
          onChange={(e) => setSubCategoryData({ ...subCategoryData, name: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          value={subCategoryData.description}
          onChange={(e) => setSubCategoryData({ ...subCategoryData, description: e.target.value })}
        />
        <select
          value={subCategoryData.categoryId}
          onChange={(e) => setSubCategoryData({ ...subCategoryData, categoryId: e.target.value })}
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button type="submit">Add Subcategory</button>
      </form>

      {/* Subcategories Table */}
      <h4>Existing Subcategories</h4>
      <table>
        <thead>
          <tr><th>Name</th><th>Description</th><th>Category</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {subCategories.length === 0 && (
            <tr><td colSpan="4">No subcategories found.</td></tr>
          )}
          {subCategories.map((sub) => {
            const category = categories.find((cat) => cat._id === sub.categoryId);
            return (
              <tr key={sub._id}>
                {editingSubCategoryId === sub._id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        value={editingSubCategoryData.name}
                        onChange={(e) => setEditingSubCategoryData({ ...editingSubCategoryData, name: e.target.value })}
                        required
                      />
                    </td>
                    <td>
                      <textarea
                        value={editingSubCategoryData.description}
                        onChange={(e) => setEditingSubCategoryData({ ...editingSubCategoryData, description: e.target.value })}
                      />
                    </td>
                    <td>
                      <select
                        value={editingSubCategoryData.categoryId}
                        onChange={(e) => setEditingSubCategoryData({ ...editingSubCategoryData, categoryId: e.target.value })}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button onClick={() => handleSubCategoryUpdate(sub._id)}>Save</button>
                      <button onClick={() => setEditingSubCategoryId(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{sub.name}</td>
                    <td>{sub.description || "-"}</td>
                    <td>{category ? category.name : "Unknown"}</td>
                    <td>
                      <button
                        onClick={() => {
                          setEditingSubCategoryId(sub._id);
                          setEditingSubCategoryData({
                            name: sub.name,
                            description: sub.description || "",
                            categoryId: sub.categoryId,
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button onClick={() => handleSubCategoryDelete(sub._id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Add Brand */}
      <form onSubmit={handleBrandSubmit}>
        <h3>Add Brand</h3>
        <input
          type="text"
          placeholder="Name"
          value={brandData.name}
          onChange={(e) => setBrandData({ ...brandData, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Logo URL"
          value={brandData.logoUrl}
          onChange={(e) => setBrandData({ ...brandData, logoUrl: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Website"
          value={brandData.website}
          onChange={(e) => setBrandData({ ...brandData, website: e.target.value })}
        />
        <textarea
          placeholder="Description"
          value={brandData.description}
          onChange={(e) => setBrandData({ ...brandData, description: e.target.value })}
        />
        <button type="submit">Add Brand</button>
      </form>

      {/* Brands Table */}
      <h4>Existing Brands</h4>
      <table>
        <thead>
          <tr><th>Name</th><th>Logo</th><th>Website</th><th>Description</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {brands.length === 0 && (
            <tr><td colSpan="5">No brands found.</td></tr>
          )}
          {brands.map((brand) => (
            <tr key={brand._id}>
              {editingBrandId === brand._id ? (
                <>
                  <td>
                    <input
                      type="text"
                      value={editingBrandData.name}
                      onChange={(e) => setEditingBrandData({ ...editingBrandData, name: e.target.value })}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Logo URL"
                      value={editingBrandData.logoUrl}
                      onChange={(e) => setEditingBrandData({ ...editingBrandData, logoUrl: e.target.value })}
                      required
                    />
                    <div style={{ marginTop: "5px" }}>
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt={brand.name} style={{ height: "40px" }} />
                      ) : (
                        "-"
                      )}
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editingBrandData.website}
                      onChange={(e) => setEditingBrandData({ ...editingBrandData, website: e.target.value })}
                    />
                  </td>
                  <td>
                    <textarea
                      value={editingBrandData.description}
                      onChange={(e) => setEditingBrandData({ ...editingBrandData, description: e.target.value })}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleBrandUpdate(brand._id)}>Save</button>
                    <button onClick={() => setEditingBrandId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{brand.name}</td>
                  <td>
                    {brand.logoUrl ? (
                      <img src={brand.logoUrl} alt={brand.name} style={{ height: "40px" }} />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {brand.website ? (
                      <a href={brand.website} target="_blank" rel="noreferrer">
                        {brand.website}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{brand.description || "-"}</td>
                  <td>
                    <button
                      onClick={() => {
                        setEditingBrandId(brand._id);
                        setEditingBrandData({
                          name: brand.name,
                          description: brand.description || "",
                          website: brand.website || "",
                          logoUrl: brand.logoUrl || "",
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleBrandDelete(brand._id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCatalogManager;
