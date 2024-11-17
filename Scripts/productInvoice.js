document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get('invoice_id'); // Get 'invoice_id' from the URL

    if (!invoiceId) {
        console.error('No invoice_id found in URL');
        return;
    }

    console.log(`Fetching invoice details for invoice_id: ${invoiceId}`); // Log invoice_id

    try {
        const response = await fetch(`/api/invoices/product/${invoiceId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const invoice = await response.json();

        console.log('Fetched invoice data:', invoice); // Log the invoice data received

        // Parse address and order summary
        const address = JSON.parse(invoice.address);
        const orderSummary = JSON.parse(invoice.order_summary);
        const items = invoice.items;

        // Update the UI with customer and order information
        document.getElementById('customer-name').textContent = invoice.customer_name || 'N/A';
        document.getElementById('customer-email').textContent = invoice.customer_email || 'N/A';
        document.getElementById('customer-phone').textContent = invoice.customer_phone || 'N/A';
        document.getElementById('customer-address').textContent = `${address.street}, ${address.city}, ${address.state}, ${address.zip}` || 'N/A';

        document.getElementById('order-subtotal').textContent = orderSummary.subtotal || 'N/A';
        document.getElementById('order-taxes').textContent = orderSummary.taxes || 'N/A';
        document.getElementById('order-processing-fee').textContent = orderSummary.processingFee || 'N/A';
        document.getElementById('order-shipping').textContent = orderSummary.shipping || 'N/A';
        document.getElementById('order-total').textContent = orderSummary.totalAmount || 'N/A';

        // Display product items
        const productInfoContainer = document.querySelector('.product-info');
        productInfoContainer.innerHTML = '';
        items.forEach((item, index) => {
            const productElement = document.createElement('div');
            productElement.classList.add('product-item');
            productElement.innerHTML = `
                <h3>Product ${index + 1}</h3>
                <p><strong>Product Name:</strong> ${item.name || 'N/A'}</p>
                <p><strong>Quantity:</strong> ${item.quantity || 'N/A'}</p>
                <p><strong>Price:</strong> $${item.price || 'N/A'}</p>
                <p><strong>Description:</strong> ${item.description || 'N/A'}</p>
            `;
            productInfoContainer.appendChild(productElement);
        });

        // Shipping label generation
        document.getElementById('generate-label-btn').addEventListener('click', async function () {
            const invoiceId = new URLSearchParams(window.location.search).get('invoice_id');

            if (!invoiceId) {
                alert('Invoice ID is missing.');
                return;
            }

            try {
                const item = invoice.items[0]; // Assuming the first item is being shipped
                const selectedShipping = item.selectedShipping || {};

                // Ensure weight is in pounds (assuming `item.weight` is in pounds if it's a decimal value)
                let weightValue = parseFloat(item.weight) || 1;
                const weightUnits = 'pounds';

                // Prepare dynamic shipping data
                const shippingData = {
                    carrierCode: "ups_walleted",
                    serviceCode: selectedShipping.serviceCode || "usps_priority_mail",
                    packageCode: "package",
                    confirmation: "delivery",
                    shipDate: new Date().toISOString().split('T')[0],
                    weight: {
                        value: weightValue,
                        units: weightUnits
                    },
                    dimensions: {
                        units: 'inches',
                        length: parseFloat(item.length) || 5,
                        width: parseFloat(item.width) || 5,
                        height: parseFloat(item.height) || 5
                    },
                    shipFrom: {
                        name: "BellaRoux Crafts LLC",
                        street1: "709 Cenntenial Blvd",
                        city: "Sulphur",
                        state: "OK",
                        postalCode: "73086",
                        country: "US"
                    },
                    shipTo: {
                        name: invoice.customer_name || "Customer",
                        street1: address.street,
                        city: address.city,
                        state: address.state,
                        postalCode: address.zip,
                        country: "US"
                    },
                    testLabel: true
                };

                console.log('Shipping Data:', shippingData); // Log the shipping data to verify

                // Generate shipping label
                const labelResponse = await fetch('/api/shipstation/create-label', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(shippingData)
                });

                const labelData = await labelResponse.json();

                if (labelData.success) {
                    alert('Shipping label generated successfully!');
                    const labelUrl = `/labels/shipping_label.pdf`;
                    window.open(labelUrl, '_blank');
                } else {
                    alert('Failed to generate shipping label: ' + labelData.error);
                }
            } catch (error) {
                console.error('Error generating shipping label:', error);
                alert('An error occurred while generating the shipping label.');
            }
        });

        // Confirmation and Email Sending
        window.confirmOrder = async function () {
            const emailTextContent = `
                Thank you for your order with BellaRoux Crafts!

                Customer Name: ${invoice.customer_name}
                Customer Email: ${invoice.customer_email}
                Customer Phone: ${invoice.customer_phone}
                Address: ${address.street}, ${address.city}, ${address.state}, ${address.zip}

                Order Summary:
                Subtotal: ${orderSummary.subtotal}
                Taxes: ${orderSummary.taxes}
                Processing Fee: ${orderSummary.processingFee}
                Shipping: ${orderSummary.shipping}
                Total Amount: ${orderSummary.totalAmount}

                Product Details:
                ${items.map((item, index) => `
                    Product ${index + 1}:
                    Name: ${item.name}
                    Quantity: ${item.quantity}
                    Price: $${item.price}
                    Description: ${item.description}
                `).join('\n')}
            `;

            try {
                const emailResponse = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        to: invoice.customer_email, // Customer's email
                        subject: 'Your BellaRoux Crafts Invoice',
                        text: emailTextContent
                    })
                });

                if (emailResponse.ok) {
                    alert('Confirmation email sent successfully!');
                } else {
                    alert('Failed to send confirmation email. Please try again.');
                }
            } catch (error) {
                console.error('Error sending confirmation email:', error);
                alert('An error occurred while sending the confirmation email.');
            }
        };

    } catch (error) {
        console.error('Error fetching invoice details:', error);
    }
});
