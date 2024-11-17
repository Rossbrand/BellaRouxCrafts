document.addEventListener('DOMContentLoaded', function () { 
    const orderItemsContainer = document.getElementById('order-items-container');
    const subtotalElement = document.getElementById('subtotal');
    const taxesElement = document.getElementById('taxes');
    const processingFeeElement = document.getElementById('processingFee');
    const shippingElement = document.getElementById('shipping');
    const totalAmountElement = document.getElementById('totalAmount');
    const checkoutForm = document.getElementById('checkoutForm'); // Standard Checkout Form
    const paintPartyForm = document.getElementById('paintPartyForm'); // Paint Party Form
    const paymentOptions = document.getElementsByName('paymentOption'); // Payment option radio buttons

    let isDeposit = false; // Flag for deposit option

    // Function to display cart items in the Order Summary
    function displayCartItems() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        orderItemsContainer.innerHTML = ''; // Clear existing items

        // Initialize subtotals
        let subtotal = 0;
        let paintingSubtotal = 0; // Separate subtotal for paintings
        let productSubtotal = 0; // Separate subtotal for products
        let hasPaintings = false;
        let hasProducts = false;

        if (cart.length === 0) {
            orderItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            updateFinancials(0, 0, 0, 0); // Update financials with zero values
            // Hide both forms if the cart is empty
            paintPartyForm.style.display = 'none';
            checkoutForm.style.display = 'none';
            return;
        }

        cart.forEach(item => {
            const price = parseFloat(item.price).toFixed(2);
            const itemElement = document.createElement('div');
            itemElement.classList.add('order-item');
            itemElement.innerHTML = `
                <p>${item.name}</p>
                <p>$${price}</p>
            `;
            orderItemsContainer.appendChild(itemElement);

            // Calculate subtotal
            subtotal += parseFloat(item.price) * item.quantity;

            // Separate the subtotal for paintings and products
            if (item.productType === 'painting') {
                paintingSubtotal += parseFloat(item.price) * item.quantity;
                hasPaintings = true;
            } else if (item.productType === 'product') {
                productSubtotal += parseFloat(item.price) * item.quantity;
                hasProducts = true;
            }
        });

        // Show the appropriate form based on the items in the cart
        if (hasPaintings && hasProducts) {
            paintPartyForm.style.display = 'block';
            checkoutForm.style.display = 'block';
        } else if (hasPaintings && !hasProducts) {
            paintPartyForm.style.display = 'block';
            checkoutForm.style.display = 'none';
        } else if (hasProducts && !hasPaintings) {
            paintPartyForm.style.display = 'none';
            checkoutForm.style.display = 'block';
        }

        // Update financial values
        updateFinancials(paintingSubtotal, productSubtotal, 0, 0, 0.00);
    }

    // Function to update financials (subtotal, taxes, fees, and total)
// Function to update financials (subtotal, taxes, fees, and total)
function updateFinancials(paintingSubtotal, productSubtotal, taxes, processingFee, shipping) {
    // Combine both subtotals for the total calculation
    let totalSubtotal = paintingSubtotal + productSubtotal;
    
    // Apply 50% deposit only to paintings if the deposit option is selected
    if (isDeposit) {
        const paintingDeposit = (paintingSubtotal / 2).toFixed(2); // 50% of painting price
        totalSubtotal = parseFloat(paintingDeposit) + productSubtotal; // Adjust subtotal for deposit
    }
    
    // Calculate taxes and processing fee based on the adjusted subtotal
    taxes = (totalSubtotal * 0.095).toFixed(2); // 9.5% tax
    processingFee = (totalSubtotal * 0.03).toFixed(2); // 3% processing fee
    shipping = parseFloat(shipping).toFixed(2); // Ensure shipping is a string with two decimals

    // Calculate the final total (subtotal + taxes + processing fee + shipping)
    let total = (
        parseFloat(totalSubtotal) +
        parseFloat(taxes) +
        parseFloat(processingFee) +
        parseFloat(shipping)
    ).toFixed(2);

    // Logging calculated values for troubleshooting
    console.log(`Adjusted Subtotal: ${totalSubtotal.toFixed(2)}, Taxes: ${taxes}, Processing Fee: ${processingFee}, Shipping: ${shipping}, Total: ${total}`);

    // Update DOM elements with the calculated values
    subtotalElement.textContent = `$${totalSubtotal.toFixed(2)}`;
    taxesElement.textContent = `$${taxes}`;
    processingFeeElement.textContent = `$${processingFee}`;
    shippingElement.textContent = `$${shipping}`;
    totalAmountElement.textContent = `$${total}`;
}


    // Event listener for payment option (full or deposit)
    paymentOptions.forEach(option => {
        option.addEventListener('change', function () {
            isDeposit = this.value === 'deposit'; // Check if the deposit option is selected
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            let paintingSubtotal = 0;
            let productSubtotal = 0;

            cart.forEach(item => {
                if (item.productType === 'painting') {
                    paintingSubtotal += parseFloat(item.price) * item.quantity;
                } else if (item.productType === 'product') {
                    productSubtotal += parseFloat(item.price) * item.quantity;
                }
            });

            updateFinancials(paintingSubtotal, productSubtotal, 0, 0, 0.00);
        });
    });

    // Call function to display cart items and financials
    displayCartItems();
});



document.getElementById('getRatesBtn').addEventListener('click', async function () {
    const shippingForm = document.getElementById('shippingForm');
    const formData = new FormData(shippingForm);
    
    // Get cart data from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    console.log("Cart Data:", cart); // Check cart data

    let totalWeight = 0;
    let totalLength = 0;
    let totalWidth = 0;
    let totalHeight = 0;

    // Calculate total weight and dimensions from the cart items
    cart.forEach(item => {
        console.log("Item Dimensions: ", item);  // Log the dimensions from each item in the cart

        totalWeight += parseFloat(item.weight) || 0; // Ensure it's parsed as a number
        totalLength = Math.max(totalLength, parseFloat(item.length) || 0); // Largest length
        totalWidth = Math.max(totalWidth, parseFloat(item.width) || 0); // Largest width
        totalHeight += parseFloat(item.height) || 0; // Add all heights
    });

    // Set default values if any field is still undefined
    totalWeight = totalWeight || 1; // Default to 1 ounce if weight is missing
    totalLength = totalLength || 5; // Default to 5 inches for length
    totalWidth = totalWidth || 5;   // Default to 5 inches for width
    totalHeight = totalHeight || 5; // Default to 5 inches for height

    // Log calculated dimensions
    console.log("Calculated Dimensions - Weight:", totalWeight, "Length:", totalLength, "Width:", totalWidth, "Height:", totalHeight);

    // Build the shipping data object using values from the form and cart
    const shippingData = {
        toState: formData.get('state') || 'OK',   // Fallback if the form doesn't have the value
        toCountry: formData.get('country') || 'US', // Default to US
        toPostalCode: formData.get('zipCode') || '73030', // Fallback postal code
        toCity: formData.get('city') || 'Davis', // Fallback city
        weight: { value: totalWeight, units: 'ounces' },  // Use calculated weight
        dimensions: { units: 'inches', length: totalLength, width: totalWidth, height: totalHeight },  // Use calculated dimensions
        confirmation: 'delivery',
        residential: true
    };

    // Log the shipping data to verify the values being sent
    console.log('Shipping Data being sent:', shippingData);

    // API call to get shipping rates
    try {
        const response = await fetch('/api/shipstation/get-rates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(shippingData)
        });

        const result = await response.json();

        if (result.success) {
            displayShippingOptions(result.rates);
        } else {
            alert('Failed to get shipping rates: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching shipping rates.');
    }
});

function displayShippingOptions(rates) {
    const shippingContainer = document.getElementById('shippingRatesContainer');
    const shippingOptionsDiv = document.getElementById('shippingOptions');

    shippingContainer.style.display = 'block';
    shippingOptionsDiv.innerHTML = ''; // Clear any previous options

    // Flatten the nested arrays and iterate over the rates
    rates.flat().forEach((rate, index) => {
        const totalCost = (rate.shipmentCost + rate.otherCost).toFixed(2); // Calculate total cost
        const serviceCode = rate.serviceCode; // Capture serviceCode for backend use

        const optionDiv = document.createElement('div');
        optionDiv.innerHTML = `
            <label>
                <input type="radio" name="shippingOption" value="${serviceCode}:${totalCost}" ${index === 0 ? 'checked' : ''}>
                ${rate.serviceName} - $${totalCost}
            </label>
        `;
        shippingOptionsDiv.appendChild(optionDiv);
    });

    // Automatically reflect the first option’s cost in the financial summary
    const firstShippingOption = document.querySelector('input[name="shippingOption"]:checked');
    if (firstShippingOption) {
        updateTotalWithShipping(parseFloat(firstShippingOption.value.split(':')[1]));
        updateProductItemsWithShippingChoice(firstShippingOption.value);
    }

    // Add event listener to update the total and store the selected shipping choice
    document.querySelectorAll('input[name="shippingOption"]').forEach(radio => {
        radio.addEventListener('change', function () {
            const [serviceCode, totalCost] = this.value.split(':');
            updateTotalWithShipping(parseFloat(totalCost));
            updateProductItemsWithShippingChoice(this.value);  // Call to store the choice
        });
    });
}



function updateTotalWithShipping(shippingCost) {
    console.log('Shipping cost received:', shippingCost); // Log shipping cost

    const subtotalElement = document.getElementById('subtotal');
    const taxesElement = document.getElementById('taxes');
    const processingFeeElement = document.getElementById('processingFee');
    const totalElement = document.getElementById('totalAmount');
    const shippingElement = document.getElementById('shipping');
    
    // Ensure the elements are not null
    if (!subtotalElement || !taxesElement || !processingFeeElement || !totalElement) {
        console.error('Subtotal, Taxes, Processing Fee, or Total element not found.');
        return;
    }

    

    // Get current subtotal
    const subtotal = parseFloat(subtotalElement.innerText.replace('$', '')) || 0;

    // Calculate taxes (8% of the subtotal)
    const taxes = (subtotal * 0.08).toFixed(2);

    // Calculate processing fee (3% of the subtotal)
    const processingFee = (subtotal * 0.03).toFixed(2);

    // Log calculated values before updating the DOM
    console.log(`Calculated Taxes: $${taxes}`);
    console.log(`Calculated Processing Fee: $${processingFee}`);

    // Calculate the final total (subtotal + shipping cost + taxes + processing fee)
    const total = (
        parseFloat(subtotal) +
        parseFloat(taxes) +
        parseFloat(processingFee) +
        parseFloat(shippingCost)
    ).toFixed(2);

    // Log total before updating the DOM
    console.log(`Calculated Total: $${total}`);

    // Update the financial summary on the page
    taxesElement.textContent = `$${taxes}`;
    processingFeeElement.textContent = `$${processingFee}`;
    totalElement.textContent = `$${total}`;
    shippingElement.textContent = `$${shippingCost.toFixed(2)}`;
}

function displayShippingOptions(rates) {
    const shippingContainer = document.getElementById('shippingRatesContainer');
    const shippingOptionsDiv = document.getElementById('shippingOptions');

    shippingContainer.style.display = 'block';
    shippingOptionsDiv.innerHTML = ''; // Clear any previous options

    // Flatten the nested arrays and iterate over the rates
    rates.flat().forEach((rate, index) => {
        const totalCost = (rate.shipmentCost + rate.otherCost).toFixed(2); // Calculate total cost
        const serviceCode = rate.serviceCode; // Capture serviceCode for backend use

        const optionDiv = document.createElement('div');
        optionDiv.innerHTML = `
            <label>
                <input type="radio" name="shippingOption" value="${serviceCode}:${totalCost}" ${index === 0 ? 'checked' : ''}>
                ${rate.serviceName} - $${totalCost}
            </label>
        `;
        shippingOptionsDiv.appendChild(optionDiv);
    });

    // Automatically reflect the first option’s cost in the financial summary
    const firstShippingOption = document.querySelector('input[name="shippingOption"]:checked');
    if (firstShippingOption) {
        updateTotalWithShipping(parseFloat(firstShippingOption.value.split(':')[1]));
        updateProductItemsWithShippingChoice(firstShippingOption.value);
    }

    // Add event listener to update the total and store the selected shipping choice
    document.querySelectorAll('input[name="shippingOption"]').forEach(radio => {
        radio.addEventListener('change', function () {
            const [serviceCode, totalCost] = this.value.split(':');
            updateTotalWithShipping(parseFloat(totalCost));
            updateProductItemsWithShippingChoice(this.value);  // Call to store the choice
        });
    });
}
function updateProductItemsWithShippingChoice(selectedShipping) {
    const [serviceCode, totalCost] = selectedShipping.split(':');  // Now storing the serviceCode

    // Get the cart from localStorage (or wherever you are storing cart data)
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Update each product item with the selected shipping choice
    cart = cart.map(item => {
        return {
            ...item,
            selectedShipping: {
                serviceCode,  // Now correctly storing the serviceCode
                totalCost     // Store the shipping cost
            }
        };
    });

    // Save the updated cart back to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    console.log("Cart updated with shipping:", cart); // Check if the cart is updated correctly
}



document.addEventListener('DOMContentLoaded', async function () {
    const payments = Square.payments('sq0idp-S1k3wgTRUL7rgnUTo4699w', 'production');  // Replace with your Square Sandbox Application ID

    let card;

    // Initialize the card payment
    async function initializeCard() {
        card = await payments.card();
        await card.attach('#card-container');
    }

    await initializeCard();

    // Handle payment submission
    document.getElementById('placeOrderBtn').addEventListener('click', async function () {
        // Proceed with tokenization for card payments
        const tokenResult = await card.tokenize();

        if (tokenResult.status === 'OK') {
            const totalAmountElement = document.getElementById('totalAmount');
            const amountInDollars = parseFloat(totalAmountElement.textContent.replace('$', ''));
            const amountInCents = Math.round(amountInDollars * 100);

            // Get the cart items from localStorage
            const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

            // Separate products and painting items
            const productItems = cartItems
                .filter(item => item.productType === 'product')
                .map(item => ({ ...item, quantity: item.quantity })); // Include quantity

            const paintingItems = cartItems
                .filter(item => item.productType === 'painting')
                .map(item => ({ ...item, quantity: item.quantity })); // Include quantity

            // Declare paymentStatus at the top and set default to 'paid'
            let paymentStatus = 'paid';

            // Default customer details (for products)
            let customerDetails = {
                name: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phoneNumber').value,
                address: {
                    street: document.getElementById('address').value,
                    city: document.getElementById('city').value,
                    state: document.getElementById('state').value,
                    zip: document.getElementById('zipCode').value
                }
            };

            // Paint Party Details
            let partyDetails = null;
            if (paintingItems.length > 0) {
                const partyDateElement = document.getElementById('partyDateInput');

                // Ensure that the party date is provided
                if (!partyDateElement || !partyDateElement.value) {
                    console.error('Party Date is missing or not selected');
                    alert('Please select a valid party date.');
                    return; // Stop further execution if no party date is selected
                }

                // Convert the selected date to YYYY-MM-DD format
                const selectedPartyDate = formatDateToMySQL(partyDateElement.value);

                // Determine payment option (full or deposit)
                const paymentOptionSelected = document.querySelector('input[name="paymentOption"]:checked');
                if (paymentOptionSelected && paymentOptionSelected.value === 'deposit') {
                    paymentStatus = 'deposit'; // Set payment status to deposit for paint parties
                }

                // Add the party details
                partyDetails = {
                    name: document.getElementById('fullName').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phoneNumber').value,
                    paintingChosen: paintingItems.length > 0 ? paintingItems[0].name : '',
                    partyDate: selectedPartyDate,
                    partyTime : document.getElementById('partyTime').value,
                    address: {
                        street: document.getElementById('partyAddress').value,
                        city: document.getElementById('partyCity').value,
                        state: document.getElementById('partyState').value,
                        zip: document.getElementById('partyZip').value
                    },
                    quantity: paintingItems.length > 0 ? paintingItems[0].quantity : 1,
                    comments: document.getElementById('comments').value, // Capture comments
                    paymentStatus: paymentStatus, // Include the payment status (full or deposit)
                    fullAmount: calculateTotal(paintingItems), // Full party amount
                    depositAmount: paymentStatus === 'deposit' ? (calculateTotal(paintingItems) / 2).toFixed(2) : 0, // Deposit
                    amountOwed: paymentStatus === 'deposit' ? (calculateTotal(paintingItems) / 2).toFixed(2) : 0 // Remaining balance
                };

                // Override customerDetails with Paint Party form values
                customerDetails = {
                    name: document.getElementById('fullName').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phoneNumber').value,
                    address: {
                        street: document.getElementById('partyAddress').value,
                        city: document.getElementById('partyCity').value,
                        state: document.getElementById('partyState').value,
                        zip: document.getElementById('partyZip').value
                    }
                };

                console.log('Party Details:', partyDetails);
            }

            // Get the order summary details
            const orderSummary = {
                subtotal: document.getElementById('subtotal').textContent,
                taxes: document.getElementById('taxes').textContent,
                processingFee: document.getElementById('processingFee').textContent,
                shipping: document.getElementById('shipping').textContent,
                totalAmount: document.getElementById('totalAmount').textContent
            };

            console.log('Order Summary:', orderSummary);

            // Send payment
            fetch('/api/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sourceId: tokenResult.token,
                    amount: amountInCents,
                    paymentStatus: paymentStatus // Send the payment status
                }),
            })
            .then(response => response.json())
            .then(async data => {
                if (data.success) {
                    let invoicePromises = [];
            
                    if (productItems.length > 0) {
                        const productInvoice = fetch('/api/invoices', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                orderNumber: 'INV' + Date.now(),
                                customer: customerDetails,
                                products: productItems,
                                totalAmount: calculateTotal(productItems),
                                paymentStatus: 'paid', // Always full payment for products
                                orderSummary // Include order summary for products
                            })
                        });
                        invoicePromises.push(productInvoice);
                    }
            
                    if (paintingItems.length > 0) {
                        const partyInvoice = fetch('/api/invoices', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                orderNumber: 'INV' + (Date.now() + 1),
                                customer: customerDetails, // Now using updated customerDetails
                                partyDetails: partyDetails,
                                totalAmount: calculateTotal(paintingItems),
                                paymentStatus: paymentStatus, // Send the correct payment status for parties
                                orderSummary // Include order summary for parties
                            })
                        });
                        invoicePromises.push(partyInvoice);
                    }
            
                    try {
                        const invoiceResponses = await Promise.all(invoicePromises);
            
                        for (const invoiceResponse of invoiceResponses) {
                            const invoiceData = await invoiceResponse.json();
                            if (invoiceData.success) {
                                console.log('Invoice created successfully!');
                            } else {
                                console.error('Failed to create invoice:', invoiceData.message);
                            }
                        }
            
                        // Clear cart and redirect only after all fetches succeed
                        localStorage.removeItem('cart');
                        window.location.href = '/thanks.html';
                    } catch (error) {
                        console.error('Error handling invoices:', error);
                        alert('An issue occurred while processing your order.');
                    }
                } else {
                    alert('Payment failed: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error during payment processing:', error);
                alert('An error occurred during payment processing.');
            });
            

    function calculateTotal(items) {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
}
});





function logPartyFormDetails() {
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const partyAddress = document.getElementById('partyAddress').value;
    const partyCity = document.getElementById('partyCity').value;
    const partyState = document.getElementById('partyState').value;
    const partyZip = document.getElementById('partyZip').value;
    const partySetting = document.getElementById('partySetting').value;
    const partyDate = document.getElementById('partyDate').value;
    const partyPhone = document.getElementById('phoneNumber').value;
    const paymentOption = document.querySelector('input[name="paymentOption"]:checked').value;

    const partyFormDetails = {
        fullName,
        email,
        partyAddress,
        partyCity,
        partyState,
        partyZip,
        partySetting,
        partyDate,
        phoneNumber,
        paymentOption
    };

    // Log the form details to the console
    console.log("Party Form Details: ", partyFormDetails);
}

function formatDateToMySQL(dateString) {
    const [month, day, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
}});