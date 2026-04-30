/**
 * server/routes/printables.js — Generate and download PDF worksheets/certificates.
 */
const express = require('express');
const router = express.Router();
const { execute } = require('../lib/turso');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

// Simple template text per sheet
const SHEET_META = {
  wordsearch: { title: 'Bible Word Search', reference: 'Proverbs 2:6' },
  crossword: { title: 'Bible Crossword', reference: 'Psalm 119:105' },
  coloring: { title: "Noah's Ark Coloring Page", reference: 'Genesis 8:1' },
  journaling: { title: 'Scripture Journaling Page', reference: 'Philippians 4:8' },
  maze: { title: 'Help Moses Through the Wilderness', reference: 'Deuteronomy 31:8' },
};

function safeText(text) {
  return String(text || '').replace(/[\r\n]+/g, ' ').slice(0, 120);
}

router.post('/download', async (req, res) => {
  const { userId, sheetId, name = 'BibleFunLand Explorer', bibleReference } = req.body || {};

  if (!sheetId || !SHEET_META[sheetId]) {
    return res.status(400).json({ error: 'sheetId is required and must be one of: ' + Object.keys(SHEET_META).join(', ') });
  }

  const data = SHEET_META[sheetId];
  const title = safeText(data.title);
  const reference = safeText(bibleReference || data.reference || 'Hebrews 11:1');

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawText('BibleFunLand Printable', { x: 38, y: 748, size: 16, font: fontBold, color: rgb(0.12, 0.46, 0.95) });
    page.drawText(title, { x: 38, y: 718, size: 22, font: fontBold, color: rgb(0.14, 0.20, 0.33) });
    page.drawText(`Name: ${safeText(name)}`, { x: 38, y: 684, size: 12, font });
    page.drawText(`Verse: ${reference}`, { x: 38, y: 668, size: 12, font });

    page.drawText('Use this page to reflect on Bible truths and share with your family.', {
      x: 38,
      y: 640,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText('\n\n--- Activity Content (simplified placeholder) ---', {
      x: 38,
      y: 620,
      size: 10,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    page.drawText('1. Read the verse slowly and underline each phrase.', { x: 38, y: 592, size: 10, font });
    page.drawText('2. Ask: how does this verse change the way I pray today?', { x: 38, y: 574, size: 10, font });
    page.drawText('3. Draw one picture of what this verse means to you.', { x: 38, y: 556, size: 10, font });

    const pdfBytes = await pdfDoc.save();

    // Award points for download
    if (userId) {
      try {
        await execute(
          `INSERT INTO user_progress (clerk_user_id, points, total_score, last_activity)
           VALUES (?, 10, 10, datetime('now'))
           ON CONFLICT(clerk_user_id) DO UPDATE SET
             points = points + 10,
             total_score = total_score + 10,
             last_activity = datetime('now')`,
          [userId]
        );
      } catch (pointErr) {
        console.warn('[Printables] could not award points', pointErr.message);
      }
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sheetId}-${Date.now()}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('[Printables /download]', err);
    res.status(500).json({ error: 'Failed to render PDF' });
  }
});

module.exports = router;
