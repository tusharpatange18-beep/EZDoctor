const EARTH_RADIUS_KM = 6371;

const toRadians = (deg) => (deg * Math.PI) / 180;

const hasCoords = (p) => Number.isFinite(p?.lat) && Number.isFinite(p?.lng);

/**
 * Great-circle distance between two lat/lng points (Haversine formula).
 * Returns Infinity when either point is missing coordinates, so such
 * items are never picked as the nearest.
 * @param {{ lat: number, lng: number }} a
 * @param {{ lat: number, lng: number }} b
 * @returns {number} distance in kilometres
 */
const haversineDistance = (a, b) => {
    if (!hasCoords(a) || !hasCoords(b)) return Infinity;
    const dLat = toRadians(b.lat - a.lat);
    const dLng = toRadians(b.lng - a.lng);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
};

/**
 * Find the nearest item from a list based on location.
 * @param {{ lat: number, lng: number }} targetLocation
 * @param {Array<{ location: { lat: number, lng: number } }>} items
 * @returns nearest item or null
 */
const findNearest = (targetLocation, items) => {
    if (!items || items.length === 0) return null;
    return items.reduce((nearest, item) => {
        const d = haversineDistance(targetLocation, item.location);
        return d < haversineDistance(targetLocation, nearest.location) ? item : nearest;
    }, items[0]);
};

module.exports = { haversineDistance, findNearest };
