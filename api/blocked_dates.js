const express = require('express');
const router = express.Router();

// Fetch blocked dates for a specific month
router.get('/:month/:year', (req, res) => {
    const month = req.params.month;
    const year = req.params.year;

    req.db.query(
        "SELECT block_date FROM blocked_dates WHERE MONTH(block_date) = ? AND YEAR(block_date) = ?",
        [month, year],
        (error, rows) => {
            if (error) {
                console.error("Error fetching blocked dates:", error);
                return res.status(500).json({ error: "Failed to fetch blocked dates" });
            }
            res.json(rows);
        }
    );
});

// Add a new blocked date
// Add a new blocked date
router.post('/', (req, res) => {
    const { blockDate, reason } = req.body;

    req.db.query(
        "INSERT INTO blocked_dates (block_date, reason) VALUES (?, ?)",
        [blockDate, reason || null],
        (error, results) => {
            if (error) {
                console.error("Error inserting blocked date:", error);
                return res.status(500).json({ success: false, message: 'Failed to block date' });
            }

            // Fetch and log current blocked dates to verify insertion
            const [year, month] = blockDate.split('-');
            req.db.query(
                "SELECT block_date FROM blocked_dates WHERE MONTH(block_date) = ? AND YEAR(block_date) = ?",
                [month, year],
                (fetchError, updatedRows) => {
                    if (fetchError) {
                        console.error("Error fetching updated blocked dates:", fetchError);
                        return res.status(500).json({ success: false, message: 'Failed to fetch updated blocked dates' });
                    }
                    console.log("Updated blocked dates after insertion:", updatedRows);
                    res.json({ success: true, message: 'Date blocked successfully', blockedDates: updatedRows });
                }
            );
        }
    );
});

// Remove a blocked date (unblock day)
router.delete('/:blockDate', (req, res) => {
    const blockDate = req.params.blockDate;

    req.db.query(
        "DELETE FROM blocked_dates WHERE block_date = ?",
        [blockDate],
        (error, results) => {
            if (error) {
                console.error("Error unblocking date:", error);
                return res.status(500).json({ success: false, message: 'Failed to unblock date' });
            }

            // Fetch updated blocked dates for the month and year
            const [year, month] = blockDate.split('-');
            req.db.query(
                "SELECT block_date FROM blocked_dates WHERE MONTH(block_date) = ? AND YEAR(block_date) = ?",
                [month, year],
                (fetchError, updatedRows) => {
                    if (fetchError) {
                        console.error("Error fetching updated blocked dates:", fetchError);
                        return res.status(500).json({ success: false, message: 'Failed to fetch updated blocked dates' });
                    }
                    res.json({ success: true, message: 'Date unblocked successfully', blockedDates: updatedRows });
                }
            );
        }
    );
});

module.exports = router;

