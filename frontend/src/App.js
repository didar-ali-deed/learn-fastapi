import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const api = axios.create({ baseURL: "http://localhost:8000" });

const EMPTY_FORM = { id: "", name: "", description: "", price: "", quantity: "" };
const LOW_STOCK = 10;
const NUMERIC_FIELDS = new Set(["id", "price", "quantity"]);

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

function getErrorMessage(err, fallback) {
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => `${d.loc?.slice(1).join(".")}: ${d.msg}`).join(", ");
  }
  return fallback;
}

function SortHeader({ field, label, sortField, sortDirection, onSort }) {
  const active = sortField === field;
  return (
    <th
      className={`sortable ${active ? `sort-${sortDirection}` : ""}`}
      onClick={() => onSort(field)}
      aria-sort={active ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
    >
      {label}
    </th>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [notice, setNotice] = useState(null); // { type: "success" | "error", text }
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState({ field: "id", direction: "asc" });

  const isEditing = editId !== null;
  const busy = fetching || saving;

  // Auto-dismiss notice
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const fetchProducts = useCallback(async () => {
    setFetching(true);
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err, "Failed to fetch products") });
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Derived data
  const visibleProducts = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const filtered = q
      ? products.filter(
        (p) =>
          String(p.id).includes(q) ||
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      )
      : products;

    const { field, direction } = sort;
    const dir = direction === "asc" ? 1 : -1;
    const numeric = NUMERIC_FIELDS.has(field);

    return [...filtered].sort((a, b) => {
      const aVal = numeric ? Number(a[field]) : String(a[field] ?? "").toLowerCase();
      const bVal = numeric ? Number(b[field]) : String(b[field] ?? "").toLowerCase();
      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
      return 0;
    });
  }, [products, filter, sort]);

  const stats = useMemo(
    () => ({
      total: products.length,
      lowStock: products.filter((p) => Number(p.quantity) < LOW_STOCK).length,
      value: products.reduce((sum, p) => sum + Number(p.price) * Number(p.quantity), 0),
    }),
    [products]
  );

  // Handlers
  const handleSort = (field) =>
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" }
    );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);

    const payload = {
      id: Number(form.id),
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
    };

    try {
      if (isEditing) {
        await api.put(`/products/${editId}`, payload);
        setNotice({ type: "success", text: "Product updated successfully" });
      } else {
        await api.post("/products", payload);
        setNotice({ type: "success", text: "Product created successfully" });
      }
      resetForm();
      await fetchProducts();
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err, "Operation failed") });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      id: product.id,
      name: product.name ?? "",
      description: product.description ?? "",
      price: product.price ?? "",
      quantity: product.quantity ?? "",
    });
    setEditId(product.id);
    setNotice(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setSaving(true);
    setNotice(null);
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (editId === id) resetForm();
      setNotice({ type: "success", text: "Product deleted successfully" });
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err, "Delete failed") });
    } finally {
      setSaving(false);
    }
  };

  const sortProps = { sortField: sort.field, sortDirection: sort.direction, onSort: handleSort };

  return (
    <div className="app-bg">
      <header className="topbar">
        <div className="brand">
          <span className="brand-badge">📦</span>
          <h1>Telusko Trac</h1>
        </div>
        <div className="top-actions">
          <button className="btn btn-light" onClick={fetchProducts} disabled={busy}>
            {fetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      <div className="container">
        <div className="stats">
          <div className="chip">Total: {stats.total}</div>
          <div className="chip">Low stock: {stats.lowStock}</div>
          <div className="chip">Value: {money(stats.value)}</div>
          <div className="search">
            <input
              type="search"
              placeholder="Search by id, name or description..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="content-grid">
          <div className="card form-card">
            <h2>{isEditing ? "Edit Product" : "Add Product"}</h2>
            <form onSubmit={handleSubmit} className="product-form">
              <input
                type="number"
                name="id"
                placeholder="ID"
                value={form.id}
                onChange={handleChange}
                min="1"
                required
                disabled={isEditing}
              />
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={form.quantity}
                onChange={handleChange}
                min="0"
                step="1"
                required
              />
              <div className="form-actions">
                <button className="btn" type="submit" disabled={saving}>
                  {saving ? "Saving..." : isEditing ? "Update" : "Add"}
                </button>
                {isEditing && (
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => {
                      resetForm();
                      setNotice(null);
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            {notice && (
              <div className={notice.type === "success" ? "success-msg" : "error-msg"} role="status">
                {notice.text}
              </div>
            )}
          </div>

          <div className="card list-card">
            <h2>Products</h2>
            {fetching && products.length === 0 ? (
              <div className="loader">Loading...</div>
            ) : (
              <div className="scroll-x">
                <table className="product-table">
                  <thead>
                    <tr>
                      <SortHeader field="id" label="ID" {...sortProps} />
                      <SortHeader field="name" label="Name" {...sortProps} />
                      <th>Description</th>
                      <SortHeader field="price" label="Price" {...sortProps} />
                      <SortHeader field="quantity" label="Quantity" {...sortProps} />
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleProducts.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td className="name-cell">{p.name}</td>
                        <td className="desc-cell" title={p.description}>
                          {p.description}
                        </td>
                        <td className="price-cell">{money(p.price)}</td>
                        <td>
                          <span className="qty-badge">{p.quantity}</span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="btn btn-edit"
                              onClick={() => handleEdit(p)}
                              disabled={saving}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-delete"
                              onClick={() => handleDelete(p.id)}
                              disabled={saving}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {visibleProducts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="empty">
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
