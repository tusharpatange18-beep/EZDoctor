import { describe, it, expect } from 'vitest';
import { haversineDistance, findNearest } from './distance';

const MUMBAI = { lat: 19.076, lng: 72.8777 };
const PUNE = { lat: 18.5204, lng: 73.8567 };

describe('haversineDistance', () => {
    it('matches the known Mumbai–Pune great-circle distance (~120 km)', () => {
        expect(haversineDistance(MUMBAI, PUNE)).toBeCloseTo(120.2, 0);
    });

    it('is zero for the same point and symmetric', () => {
        expect(haversineDistance(MUMBAI, MUMBAI)).toBe(0);
        expect(haversineDistance(PUNE, MUMBAI)).toBeCloseTo(haversineDistance(MUMBAI, PUNE), 9);
    });

    it('treats missing coordinates as infinitely far', () => {
        expect(haversineDistance(MUMBAI, {})).toBe(Infinity);
        expect(haversineDistance(undefined, PUNE)).toBe(Infinity);
    });
});

describe('findNearest', () => {
    it('picks the closest ambulance and skips ones without a location', () => {
        const ambulances = [
            { id: 'pune', location: PUNE },
            { id: 'no-gps', location: {} },
            { id: 'bandra', location: { lat: 19.0596, lng: 72.8295 } },
        ];
        expect(findNearest(MUMBAI, ambulances).id).toBe('bandra');
    });

    it('returns null when there are no ambulances', () => {
        expect(findNearest(MUMBAI, [])).toBeNull();
        expect(findNearest(MUMBAI, undefined)).toBeNull();
    });
});
