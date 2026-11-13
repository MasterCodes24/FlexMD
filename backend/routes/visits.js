const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// POST /visits  — Member 1's exact JSON contract
router.post('/', async (req, res) => {
  const {
    patient_id,
    problem,
    diagnosis_or_solution,
    medicines,
    advice,
    charges,
    payment_mode,
    follow_up_date,
  } = req.body;

  if (!patient_id || charges === undefined || !payment_mode) {
    return res.status(400).json({
      ok: false,
      error: { code: 'VALIDATION_ERROR', message: 'patient_id, charges, and payment_mode are required' },
    });
  }

  if (!['cash', 'online'].includes(payment_mode)) {
    return res.status(400).json({
      ok: false,
      error: { code: 'VALIDATION_ERROR', message: "payment_mode must be 'cash' or 'online'" },
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify patient belongs to this clinic
    const patCheck = await client.query(
      'SELECT id FROM patients WHERE id = $1 AND clinic_id = $2',
      [patient_id, req.clinicId]
    );
    if (!patCheck.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Patient not found' } });
    }

    // Normalize medicines to array
    const medsArray = Array.isArray(medicines) ? medicines : (medicines ? [medicines] : []);

    // Insert visit
    const { rows: visitRows } = await client.query(
      `INSERT INTO visits
        (clinic_id, patient_id, problem, diagnosis_or_solution, medicines, advice,
         charges, payment_mode, follow_up_date)
       VALUES ($1, $2, $3, $4, $5::TEXT[], $6, $7, $8, $9)
       RETURNING *`,
      [
        req.clinicId,
        patient_id,
        problem || null,
        diagnosis_or_solution || null,
        medsArray,
        advice || null,
        Number(charges),
        payment_mode,
        follow_up_date || null,
      ]
    );

    const visit = visitRows[0];

    // Insert payment record
    await client.query(
      `INSERT INTO payments (clinic_id, patient_id, visit_id, amount, mode, status)
       VALUES ($1, $2, $3, $4, $5, 'paid')`,
      [req.clinicId, patient_id, visit.id, Number(charges), payment_mode]
    );

    // Auto-reduce inventory quantity for prescribed medicines when the doctor dispenses them
    if (medsArray.length > 0) {
      const { rows: inventoryItems } = await client.query(
        'SELECT id, name, quantity, unit FROM inventory_items WHERE clinic_id = $1 AND archived = false',
        [req.clinicId]
      );

      for (const med of medsArray) {
        if (!med) continue;

        let medName = '';
        let qtyToDeduct = 1;

        if (typeof med === 'string') {
          // Extract amount if specified (e.g. "Qty: 2", "3 strips", "1 bottle")
          const explicitMatch = med.match(/(?:\bqty[:\s]+|\(\s*qty[:\s]+)(\d+)/i);
          const unitMatch = med.match(/(\d+)\s*(?:strip|strips|bottle|bottles|pack|packs|sachet|sachets|box|boxes|unit|units)\b/i);

          if (explicitMatch) {
            qtyToDeduct = Math.max(1, parseInt(explicitMatch[1], 10));
          } else if (unitMatch) {
            qtyToDeduct = Math.max(1, parseInt(unitMatch[1], 10));
          }

          medName = med.toLowerCase().trim();
        } else if (typeof med === 'object') {
          medName = (med.name || '').toLowerCase().trim();
          qtyToDeduct = Math.max(1, Number(med.quantity) || 1);
        }

        // Match inventory item if name appears in prescribed text or vice-versa
        const match = inventoryItems.find((item) => {
          const itemName = item.name.toLowerCase().trim();
          const itemNameBase = itemName.replace(/^(tab|tablet|syp|syrup|cap|capsule|inj|injection)\.?\s+/i, '');
          return (
            medName.includes(itemName) ||
            medName.includes(itemNameBase) ||
            itemName.includes(medName)
          );
        });

        if (match) {
          await client.query(
            'UPDATE inventory_items SET quantity = GREATEST(0, quantity - $1) WHERE id = $2',
            [qtyToDeduct, match.id]
          );
          match.quantity = Math.max(0, match.quantity - qtyToDeduct);
        }
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ ok: true, data: visit });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: e.message } });
  } finally {
    client.release();
  }
});

module.exports = router;

