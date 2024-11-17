document.addEventListener('DOMContentLoaded', async function () { 
    const productInvoicesContainer = document.querySelector('#productInvoices .invoice-list');
    const partyInvoicesContainer = document.querySelector('#partyInvoices .invoice-list');

    // Function to fetch invoices
    async function fetchInvoices(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching invoices:", error);
            return [];
        }
    }

    // Fetch and display product invoices
    const productInvoices = await fetchInvoices('/api/invoices/products');
    productInvoices.forEach(invoice => {
        const a = document.createElement('a');
        // Log the invoice_id to verify
        console.log(`Product Invoice ID: ${invoice.invoice_id}`);
        // Pass the invoice_id as a URL parameter
        a.href = `productInvoiceDetails.html?invoice_id=${invoice.invoice_id}`;
        a.className = 'invoice-link';
        a.textContent = `Order #${invoice.order_number} - Status: ${invoice.payment_status}`;
        productInvoicesContainer.appendChild(a);
    });

    // Fetch and display party invoices
    const partyInvoices = await fetchInvoices('/api/invoices/parties');
    partyInvoices.forEach(invoice => {
        const a = document.createElement('a');
        // Log the invoice_id to verify
        console.log(`Party Invoice ID: ${invoice.invoice_id}`);
        // Pass the invoice_id as a URL parameter
        a.href = `partyInvoiceDetails.html?invoice_id=${invoice.invoice_id}`;
        a.className = 'invoice-link';
        a.textContent = `Invoice #${invoice.order_number} - Status: ${invoice.payment_status}`;
        partyInvoicesContainer.appendChild(a);
    });
});

