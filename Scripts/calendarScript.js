document.addEventListener('DOMContentLoaded', async function () { 
    const calendarContainer = document.querySelector('.calendar');
    const monthPicker = document.getElementById('monthPicker');
    const yearPicker = document.getElementById('yearPicker');
    const currentDate = new Date();
    let isBlocking = false;

    populateMonthAndYearPickers(currentDate);

    monthPicker.addEventListener('change', () => updateCalendar());
    yearPicker.addEventListener('change', () => updateCalendar());

    const toggleBlockModeButton = document.getElementById('toggleBlockMode');
    toggleBlockModeButton.addEventListener('click', async function () {
        isBlocking = !isBlocking;
        this.textContent = isBlocking ? "Save Blocked Days" : "Block Days";

        if (!isBlocking) {
            await updateCalendar(); // Reload the calendar to reflect the backend's latest data
        }
    });

    // Populate month and year pickers
    function populateMonthAndYearPickers(date) {
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = new Date(Date.UTC(0, i - 1)).toLocaleString('en-US', { month: 'long' });
            if (i === date.getMonth() + 1) option.selected = true;
            monthPicker.appendChild(option);
        }

        const currentYear = date.getFullYear();
        for (let i = currentYear - 5; i <= currentYear + 5; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === currentYear) option.selected = true;
            yearPicker.appendChild(option);
        }
    }

    // Function to update the calendar
    async function updateCalendar() {
        console.log('Updating calendar');
        calendarContainer.innerHTML = ''; // Clear the current calendar

        const month = monthPicker.value;
        const year = yearPicker.value;
        const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

        // Fetch party dates and blocked dates
        const partyResponse = await fetch(`/api/invoices/parties/${month}/${year}`);
        const parties = await partyResponse.json();

        const blockedResponse = await fetch(`/api/blocked/${month}/${year}`);
        const blockedDates = await blockedResponse.json();
        console.log("Fetched blocked dates:", blockedDates); // Log fetched blocked dates

        // Display the calendar with party and blocked dates
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day', 'available');
            dayElement.textContent = day;
            dayElement.dataset.day = day;

            // Check if the day has a party
            const party = parties.find(p => new Date(p.partyDate).getUTCDate() === day);
            if (party) {
                dayElement.classList.add(party.status === 'confirmed' ? 'confirmed' : 'unconfirmed');
                dayElement.classList.remove('available');
                dayElement.addEventListener('click', function () {
                    window.location.href = `partyInvoiceDetails.html?invoice_id=${party.invoice_id}`;
                });
            }

            // Check if the day is blocked
            const isBlocked = blockedDates.some(bd => {
                const blockedDate = new Date(bd.block_date);
                return blockedDate.getUTCDate() === day &&
                       blockedDate.getUTCMonth() + 1 === parseInt(month) &&
                       blockedDate.getUTCFullYear() === parseInt(year);
            });

            if (isBlocked) {
                dayElement.classList.add('blocked');
                dayElement.classList.remove('available');
                console.log(`Blocked day identified: ${day}`);
            }

            // Handle blocking and unblocking in blocking mode
            dayElement.addEventListener('click', async function () {
                if (isBlocking && this.classList.contains('available')) {
                    this.classList.add('blocked');
                    this.classList.remove('available');
                    const blockDate = new Date(Date.UTC(year, month - 1, day)).toISOString().split('T')[0];
                    console.log(`Blocking date: ${blockDate}`);
                    await blockDay(blockDate); // Block the day
                    await updateCalendar(); // Refresh calendar after blocking action
                } else if (isBlocking && this.classList.contains('blocked')) {
                    this.classList.remove('blocked');
                    this.classList.add('available');
                    const blockDate = new Date(Date.UTC(year, month - 1, day)).toISOString().split('T')[0];
                    console.log(`Unblocking date: ${blockDate}`);
                    await unblockDay(blockDate); // Unblock the day
                    await updateCalendar(); // Refresh calendar after unblocking action
                }
            });

            calendarContainer.appendChild(dayElement);
        }
        console.log('Calendar updated');
    }

    // Block day function with date normalization
    async function blockDay(blockDate) {
        try {
            const response = await fetch('/api/blocked', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blockDate })
            });
            if (!response.ok) throw new Error(`Failed to block day: ${response.statusText}`);
            console.log(`Day ${blockDate} blocked successfully`);
        } catch (error) {
            console.error('Error blocking date:', error);
            alert('Failed to block day.');
        }
    }

    // Unblock day function with date normalization
    async function unblockDay(blockDate) {
        try {
            const response = await fetch(`/api/blocked/${blockDate}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error(`Failed to unblock day: ${response.statusText}`);
            console.log(`Day ${blockDate} unblocked successfully`);
        } catch (error) {
            console.error('Error unblocking date:', error);
            alert('Failed to unblock day.');
        }
    }

    // Initial load of the calendar
    updateCalendar();
});
