const EARTH_RADIUS_KM = 6371;

/** Degrees -> radians (Math.sin and Math.cos work in radians). */
function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
}

/** True if the point has real numbers for both lat and lng. */
function hasCoords(point) {
    if (!point) {
        return false;
    }
    return Number.isFinite(point.lat) && Number.isFinite(point.lng);
}

/**
 * Great-circle distance between two lat/lng points (Haversine formula).
 * Returns Infinity when either point is missing coordinates, so such
 * items are never picked as the nearest.
 * @param {{ lat: number, lng: number }} a
 * @param {{ lat: number, lng: number }} b
 * @returns {number} distance in kilometres
 */
function haversineDistance(a, b) {
    if (!hasCoords(a) || !hasCoords(b)) {
        return Infinity;
    }
    const dLat = toRadians(b.lat - a.lat);
    const dLng = toRadians(b.lng - a.lng);

    const sinHalfDLat = Math.sin(dLat / 2);
    const sinHalfDLng = Math.sin(dLng / 2);
    const h = sinHalfDLat * sinHalfDLat
        + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * sinHalfDLng * sinHalfDLng;

    // h is the "haversine" of the angle between the points; asin turns it back into the angle
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Find the nearest item from a list based on location.
 * @param {{ lat: number, lng: number }} targetLocation
 * @param {Array<{ location: { lat: number, lng: number } }>} items
 * @returns nearest item or null
 */
function findNearest(targetLocation, items) {
    if (!items || items.length === 0) {
        return null;
    }

    // Start with the first item, then keep whichever is closer
    let nearest = items[0];
    let nearestDistance = haversineDistance(targetLocation, nearest.location);
    for (const item of items) {
        const distance = haversineDistance(targetLocation, item.location);
        if (distance < nearestDistance) {
            nearest = item;
            nearestDistance = distance;
        }
    }
    return nearest;
}

module.exports = { haversineDistance, findNearest };
