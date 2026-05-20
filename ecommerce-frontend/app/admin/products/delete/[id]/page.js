"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";

export default function DeleteProductConfirm({ params }) {
  const { id } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const user = getUser();

  if (!user || user.role !== "admin") {
    return (
      <div className="container" style={{ paddingTop: 28 }}>
        <h2>Access denied</h2>
        <p>You must be an admin to access this page.</p>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this product?")) return;
    setLoading(true);
    try {
      await api.delete(`/admin/product/${id}`); // matches admin route
      alert("Product deleted");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container" style={{ paddingTop: 28 }}>
      <div className="card" style={{ padding: 20, maxWidth: 700 }}>
        <h2 style={{ marginTop: 0 }}>Delete Product</h2>
        <p style={{ color: "var(--muted)" }}>
          This action is irreversible. Deleting the product will remove it from the storefront and all related references.
        </p>

        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <button onClick={handleDelete} className="btn btn-peach" disabled={loading}>
            {loading ? "Deleting..." : "Delete Product"}
          </button>
          <button onClick={handleCancel} className="btn btn-mint">Cancel</button>
        </div>
      </div>
    </div>
  );
}
