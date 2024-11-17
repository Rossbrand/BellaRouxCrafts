document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get('invoice_id');

    if (!invoiceId) {
        console.error('No invoice_id found in URL');
        return;
    }

    console.log(`Fetching invoice details for invoice_id: ${invoiceId}`);

    let invoice, address, orderSummary, items;

    try {
        const response = await fetch(`/api/invoices/party/${invoiceId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        invoice = await response.json();

        console.log('Fetched invoice data:', invoice);

        // Parse nested fields
        address = JSON.parse(invoice.address);
        orderSummary = JSON.parse(invoice.order_summary);
        items = invoice.items;

        // Update the UI with the fetched data
        document.getElementById('painting-name').textContent = items.paintingChosen || 'N/A';
        document.getElementById('num-guests').textContent = items.quantity || 'N/A';
        document.getElementById('total-price').textContent = orderSummary.totalAmount || 'N/A';
        document.getElementById('location').textContent = `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
        document.getElementById('party-date').textContent = items.partyDate || 'N/A';
        document.getElementById('party-time').textContent = items.partyTime || 'N/A';
        document.getElementById('payment-status').textContent = items.paymentStatus || 'N/A';
        document.getElementById('host-name').textContent = items.name || 'N/A';
        document.getElementById('host-email').textContent = items.email || 'N/A';
        document.getElementById('host-phone').textContent = items.phone || 'N/A';
        document.getElementById('party-comments').textContent = items.comments || 'No additional comments';
        document.getElementById('order-subtotal').textContent = orderSummary.subtotal || 'N/A';
        document.getElementById('order-taxes').textContent = orderSummary.taxes || 'N/A';
        document.getElementById('order-processing-fee').textContent = orderSummary.processingFee || 'N/A';
        document.getElementById('order-shipping').textContent = orderSummary.shipping || 'N/A';
        document.getElementById('order-total').textContent = orderSummary.totalAmount || 'N/A';
        document.getElementById('full-amount').textContent = `$${items.fullAmount || 'N/A'}`;
        document.getElementById('deposit-amount').textContent = `$${items.depositAmount || 'N/A'}`;
        document.getElementById('amount-owed').textContent = `$${items.amountOwed || 'N/A'}`;

    } catch (error) {
        console.error('Error fetching invoice details:', error);
    }

    // Define the function to send the email
    window.confirmParty = async function () {
        // Prepare email content as plain text
        const emailTextContent = `
            Thank you for your order with BellaRoux Crafts!
    
            Painting Chosen: ${items.paintingChosen}
            Number of Guests: ${items.quantity}
            Total Price: ${orderSummary.totalAmount}
            Location: ${address.street}, ${address.city}, ${address.state} ${address.zip}
            Party Date: ${items.partyDate}
            Party Time: ${items.partyTime}
            Payment Status: ${items.paymentStatus}
    
            Host Information:
            Name: ${items.name}
            Email: ${items.email}
            Phone: ${items.phone}
    
            Order Summary:
            Subtotal: ${orderSummary.subtotal}
            Taxes: ${orderSummary.taxes}
            Processing Fee: ${orderSummary.processingFee}
            Shipping: ${orderSummary.shipping}
            Amount Owed: ${items.amountOwed}
        `;
    
        // Send the email using the /api/send-email route
        try {
            const emailResponse = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: items.email, // Send to the customer's email
                    subject: 'Your BellaRoux Crafts Invoice',
                    text: emailTextContent // Plain text content
                })
            });
    
            if (emailResponse.ok) {
                console.log('Email sent successfully');
                alert('The party has been confirmed, and an email has been sent to the host.');
            } else {
                console.error('Failed to send email');
                alert('Failed to send the confirmation email. Please try again.');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            alert('An error occurred while sending the confirmation email.');
        }
    };
    
});
