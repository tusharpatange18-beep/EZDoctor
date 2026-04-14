/**
 * Euclidean distance between two lat/lng points.
 * Suitable for city-scale proximity matching.
 * @param {{ lat: number, lng: number }} a
 * @param {{ lat: number, lng: number }} b
 * @returns {number}
 */
const euclideanDistance = (a, b) => {
    const latDiff = (a?.lat || 0) - (b?.lat || 0);
    const lngDiff = (a?.lng || 0) - (b?.lng || 0);
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
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
        const d = euclideanDistance(targetLocation, item.location);
        return d < euclideanDistance(targetLocation, nearest.location) ? item : nearest;
    }, items[0]);
};

module.exports = { euclideanDistance, findNearest };
