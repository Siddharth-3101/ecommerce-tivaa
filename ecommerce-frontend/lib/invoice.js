export function downloadInvoice(order, items) {
    if (typeof window === 'undefined') return;

    const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    const shippingCost = Number(order.shipping_cost || 0);
    const formattedOrderId = "TEJWL" + String(order.id).padStart(2, '0');

    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.left = '-9999px';
    
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    
    const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : new Date().toLocaleDateString();

    const itemsRows = items.map((item) => `
        <tr style="border-bottom: 1px solid #EADCF8;">
            <td style="padding: 12px; font-size: 0.95rem; color: #2B1B35;">
                <div style="font-weight: 500;">${item.name}</div>
                ${item.selected_variation ? `<div style="font-size: 0.8rem; color: #6F5B7A; margin-top: 4px;">Variant: ${item.selected_variation}</div>` : ''}
            </td>
            <td style="padding: 12px; text-align: center; font-size: 0.95rem; color: #6F5B7A;">${item.quantity}</td>
            <td style="padding: 12px; text-align: right; font-size: 0.95rem; color: #6F5B7A;">₹${Number(item.price).toFixed(2)}</td>
            <td style="padding: 12px; text-align: right; font-weight: 600; font-size: 0.95rem; color: #7A38C2;">₹${(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
        </tr>
    `).join('');

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Invoice - Order #${formattedOrderId}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Poppins:wght@300;400;500;600;700&display=swap');
                body {
                    font-family: 'Poppins', sans-serif;
                    color: #2B1B35;
                    margin: 0;
                    padding: 40px;
                    background: #ffffff;
                }
                .invoice-container {
                    max-width: 800px;
                    margin: 0 auto;
                    border: 1px solid #EADCF8;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 4px 24px rgba(122, 56, 194, 0.03);
                }
                .header-table {
                    width: 100%;
                    margin-bottom: 40px;
                    border-collapse: collapse;
                }
                .brand-title {
                    font-family: 'Cinzel', serif;
                    font-size: 2.2rem;
                    font-weight: 700;
                    letter-spacing: 2px;
                    color: #7A38C2;
                    margin: 0;
                }
                .brand-subtitle {
                    font-size: 0.8rem;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    color: #6F5B7A;
                    margin-top: 4px;
                }
                .meta-table {
                    width: 100%;
                    margin-bottom: 30px;
                    border-collapse: collapse;
                }
                .meta-column {
                    width: 50%;
                    vertical-align: top;
                }
                .section-heading {
                    font-family: 'Cinzel', serif;
                    font-size: 0.9rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #7A38C2;
                    letter-spacing: 1px;
                    margin-bottom: 10px;
                    border-bottom: 1px solid #EADCF8;
                    padding-bottom: 6px;
                }
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                }
                .items-table th {
                    background: #FAF8FD;
                    border-bottom: 2px solid #C0A9D8;
                    padding: 12px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #2B1B35;
                }
                .totals-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                .totals-row td {
                    padding: 8px 12px;
                    font-size: 0.95rem;
                }
                .totals-label {
                    text-align: right;
                    color: #6F5B7A;
                    width: 80%;
                }
                .totals-value {
                    text-align: right;
                    font-weight: 500;
                    width: 20%;
                }
                .totals-grand {
                    font-weight: 700 !important;
                    font-size: 1.2rem !important;
                    color: #7A38C2 !important;
                }
                .footer {
                    text-align: center;
                    margin-top: 50px;
                    font-size: 0.85rem;
                    color: #A292B0;
                    border-top: 1px dashed #C0A9D8;
                    padding-top: 20px;
                }
                @media print {
                    body {
                        padding: 0;
                    }
                    .invoice-container {
                        border: none;
                        box-shadow: none;
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            <div class="invoice-container">
                <table class="header-table">
                    <tr>
                        <td>
                            <div class="brand-title">TIVAA</div>
                            <div class="brand-subtitle">Fine Jewelry & Boutique</div>
                        </td>
                        <td style="text-align: right; vertical-align: top;">
                            <div style="font-size: 1.4rem; font-weight: 700; color: #2B1B35;">INVOICE</div>
                            <div style="font-size: 0.9rem; color: #6F5B7A; margin-top: 6px;">Order ID: #${formattedOrderId}</div>
                            <div style="font-size: 0.9rem; color: #6F5B7A;">Date: ${dateStr}</div>
                        </td>
                    </tr>
                </table>

                <table class="meta-table">
                    <tr>
                        <td class="meta-column" style="padding-right: 20px;">
                            <div class="section-heading">Billing Details</div>
                            <div style="font-size: 0.95rem; line-height: 1.6; color: #2B1B35;">
                                <strong>${order.customer_name || 'Valued Customer'}</strong><br/>
                                Email: ${order.customer_email || '-'}<br/>
                                Phone: ${order.phone || '-'}<br/>
                            </div>
                        </td>
                        <td class="meta-column" style="padding-left: 20px;">
                            <div class="section-heading">Shipping Address</div>
                            <div style="font-size: 0.95rem; line-height: 1.6; color: #2B1B35;">
                                ${order.address || '-'}<br/>
                                ${order.city || '-'}, ${order.state || '-'}<br/>
                                Pincode: ${order.pincode || '-'}<br/>
                            </div>
                        </td>
                    </tr>
                </table>

                <table class="meta-table" style="margin-top: -10px; margin-bottom: 40px;">
                    <tr>
                        <td class="meta-column">
                            <div class="section-heading">Payment Information</div>
                            <div style="font-size: 0.95rem; line-height: 1.6; color: #2B1B35;">
                                Method: <span style="text-transform: capitalize;">${order.payment_method || '-'}</span><br/>
                                Status: <span style="text-transform: capitalize; font-weight: 600; color: ${order.order_status === 'paid' || order.order_status === 'completed' || order.order_status === 'delivered' ? '#10B981' : '#2B1B35'}">${order.order_status || '-'}</span><br/>
                                ${order.payment_reference ? `Transaction ID: <code>${order.payment_reference}</code>` : ''}
                            </div>
                        </td>
                    </tr>
                </table>

                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="text-align: left; width: 50%;">Item Description</th>
                            <th style="text-align: center; width: 10%;">Qty</th>
                            <th style="text-align: right; width: 20%;">Unit Price</th>
                            <th style="text-align: right; width: 20%;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsRows}
                    </tbody>
                </table>

                <table class="totals-table">
                    <tr class="totals-row">
                        <td class="totals-label">Subtotal</td>
                        <td class="totals-value">₹${subtotal.toFixed(2)}</td>
                    </tr>
                    <tr class="totals-row">
                        <td class="totals-label">Shipping</td>
                        <td class="totals-value" style="color: ${shippingCost > 0 ? '#2B1B35' : '#10B981'}; font-weight: 600;">${shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : "Free"}</td>
                    </tr>
                    <tr class="totals-row">
                        <td class="totals-label" style="font-weight: 600; padding-top: 12px; border-top: 1px solid #EADCF8;">Total Amount Paid</td>
                        <td class="totals-value totals-grand" style="padding-top: 12px; border-top: 1px solid #EADCF8;">₹${Number(order.total).toFixed(2)}</td>
                    </tr>
                </table>

                <div class="footer">
                    Thank you for choosing Tivaa. We hope to see you again soon!<br/>
                    For questions, contact support at support@tivaajewelery.com
                </div>
            </div>
        </body>
        </html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Trigger printing once iframe is fully loaded
    iframe.contentWindow.focus();
    setTimeout(() => {
        iframe.contentWindow.print();
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    }, 500);
}
