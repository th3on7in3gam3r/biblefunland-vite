/**
 * server/routes/churchFinder.js
 * Proxies Google Places API for church search — key stays server-side.
 * Mount: app.use('/api/churches', require('./routes/churchFinder'))
 */

const express = require('express');
const router = express.Router();

const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY;

// GET /api/churches/search?lat=&lng=&radius=&query=
router.get('/search', async (req, res) => {
  if (!PLACES_KEY) {
    return res.status(503).json({
      error: 'GOOGLE_PLACES_API_KEY not configured',
      setup: true,
    });
  }

  const { lat, lng, radius = 8000, query = 'church' } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  try {
    // Use Places API (New) — Text Search
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=church&keyword=${encodeURIComponent(query)}&key=${PLACES_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('[ChurchFinder] Places API error:', data.status, data.error_message);
      return res.status(502).json({ error: data.error_message || data.status });
    }

    // Shape the results
    const churches = (data.results || []).map(p => ({
      id: p.place_id,
      name: p.name,
      address: p.vicinity,
      lat: p.geometry?.location?.lat,
      lng: p.geometry?.location?.lng,
      rating: p.rating || null,
      userRatingsTotal: p.user_ratings_total || 0,
      openNow: p.opening_hours?.open_now ?? null,
      photo: p.photos?.[0]?.photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photos[0].photo_reference}&key=${PLACES_KEY}`
        : null,
      types: p.types || [],
    }));

    res.json({ churches, total: churches.length });
  } catch (err) {
    console.error('[ChurchFinder] Error:', err.message);
    res.status(500).json({ error: 'Failed to search churches' });
  }
});

// GET /api/churches/details/:placeId — get website, phone, hours
router.get('/details/:placeId', async (req, res) => {
  if (!PLACES_KEY) return res.status(503).json({ error: 'GOOGLE_PLACES_API_KEY not configured', setup: true });

  try {
    const fields = 'name,formatted_address,formatted_phone_number,website,opening_hours,rating,url,editorial_summary';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${req.params.placeId}&fields=${fields}&key=${PLACES_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') return res.status(502).json({ error: data.error_message || data.status });
    res.json({ details: data.result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch church details' });
  }
});

// GET /api/churches/geocode?address= — convert city name to lat/lng
router.get('/geocode', async (req, res) => {
  if (!PLACES_KEY) return res.status(503).json({ error: 'GOOGLE_PLACES_API_KEY not configured', setup: true });

  const { address } = req.query;
  if (!address) return res.status(400).json({ error: 'address required' });

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${PLACES_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') return res.status(404).json({ error: 'Location not found' });
    const loc = data.results[0].geometry.location;
    res.json({ lat: loc.lat, lng: loc.lng, formatted: data.results[0].formatted_address });
  } catch (err) {
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

module.exports = router;
