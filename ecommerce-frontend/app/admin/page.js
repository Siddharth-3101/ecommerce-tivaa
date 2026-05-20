import Link from "next/link";

export default function AdminHome() {
    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '80px' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Admin Portal</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Manage your store and oversee operations.</p>

            <div className="grid">
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        </div>
                        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Inventory</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>View all products in your catalog, edit details, adjust stock, and manage prices.</p>
                    <Link href="/admin/products" className="btn btn-primary" style={{ width: '100%' }}>
                        Manage Products
                    </Link>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </div>
                        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Create</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Add new items to your catalog, upload high-quality images, and set availability.</p>
                    <Link href="/admin/products/add" className="btn btn-secondary" style={{ width: '100%' }}>
                        Add New Product
                    </Link>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                        </div>
                        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Categories</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Organize your products into categories for better navigation and filtering.</p>
                    <Link href="/admin/categories" className="btn btn-secondary" style={{ width: '100%' }}>
                        Manage Categories
                    </Link>
                </div>
            </div>
        </div>
    );
}
