document.addEventListener('DOMContentLoaded', async function() {
    const calendarModal = document.getElementById('calendarModal');
    const openModalButton = document.getElementById('openCalendarModal');
    const closeModalButton = document.querySelector('.close');
    const partyDateInput = document.getElementById('partyDateInput');
    const calendarContainer = document.querySelector('.modal .calendar');
    const monthPicker = document.getElementById('monthPicker');
    const yearPicker = document.getElementById('yearPicker');

    // Open the modal when the user clicks the button
    openModalButton.addEventListener('click', function() {
        calendarModal.style.display = 'block';
    });

    // Close the modal when the user clicks the 'X' button
    closeModalButton.addEventListener('click', function() {
        calendarModal.style.display = 'none';
    });

    // Populate month and year dropdowns
    const currentDate = new Date();
    populateMonthAndYearPickers(currentDate);

    // Update the calendar when the month or year is changed
    monthPicker.addEventListener('change', updateCalendar);
    yearPicker.addEventListener('change', updateCalendar);

    function populateMonthAndYearPickers(date) {
        // Populate the month picker
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = new Date(0, i - 1).toLocaleString('en-US', { month: 'long' });
            if (i === date.getMonth() + 1) option.selected = true;
            monthPicker.appendChild(option);
        }

        // Populate the year picker
        const currentYear = date.getFullYear();
        for (let i = currentYear - 5; i <= currentYear + 5; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === currentYear) option.selected = true;
            yearPicker.appendChild(option);
        }
    }

    async function updateCalendar() {
        calendarContainer.innerHTML = ''; // Clear the existing calendar

        const month = monthPicker.value;
        const year = yearPicker.value;
        const daysInMonth = new Date(year, month, 0).getDate();

        // Fetch party dates and blocked dates
        const partyResponse = await fetch(`/api/invoices/parties/${month}/${year}`);
        const parties = await partyResponse.json();

        const blockedResponse = await fetch(`/api/blocked/${month}/${year}`);
        const blockedDates = await blockedResponse.json();

        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day', 'available');
            dayElement.textContent = day;
            dayElement.dataset.day = day;

            const currentDate = new Date(year, month - 1, day);

            // Check if the day has a party
            const party = parties.find(p => new Date(p.partyDate).getDate() === day);
            if (party) {
                if (party.status === 'confirmed') {
                    dayElement.classList.add('confirmed');
                    dayElement.classList.remove('available');
                } else {
                    dayElement.classList.add('unconfirmed');
                    dayElement.classList.remove('available');
                }
                dayElement.classList.add('unselectable'); // Prevent selecting confirmed/unconfirmed days
            }

            // Check if the day is blocked
            const isBlocked = blockedDates.some(bd => new Date(bd.block_date).getDate() === day);
            if (isBlocked) {
                dayElement.classList.add('blocked');
                dayElement.classList.remove('available');
                dayElement.classList.add('unselectable'); // Prevent selecting blocked days
            }

            // Add click event for selecting available days
            if (!dayElement.classList.contains('unselectable')) {
                dayElement.addEventListener('click', function() {
                    // Set selected party date for display in MM/DD/YYYY format
                    const displayedDate = `${('0' + (currentDate.getMonth() + 1)).slice(-2)}/${('0' + currentDate.getDate()).slice(-2)}/${currentDate.getFullYear()}`;
                    partyDateInput.value = displayedDate;

                    // Store the ISO format (YYYY-MM-DD) for submission
                    const selectedDateISO = currentDate.toISOString().split('T')[0];
                    localStorage.setItem('selectedPartyDate', selectedDateISO);

                    calendarModal.style.display = 'none'; // Close modal after selecting date
                });
            }

            calendarContainer.appendChild(dayElement);
        }
    }

    // Initial load of the calendar
    updateCalendar();
});
