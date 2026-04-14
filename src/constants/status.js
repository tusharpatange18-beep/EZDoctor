/**
 * STATUS_CONFIG
 * Single source of truth for all status label / color / emoji mappings.
 * Used by: DoctorDashboard, AdminPanel, PatientTracking, StatusBadge
 *
 * Labels match the exact spec:
 *   pending     → "⏳ Waiting for ambulance"
 *   accepted    → "🚑 Ambulance assigned"
 *   on_the_way  → "🚑 On the way"
 *   arrived     → "📍 Reached location"
 *   completed   → "✅ Completed"
 */
export const STATUS_CONFIG = {
    pending: {
        label: 'Waiting for ambulance',
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        color: 'text-amber-700',
        border: 'border-l-amber-400',
        dot: 'bg-amber-400',
        pulse: true,
    },
    accepted: {
        label: 'Ambulance assigned',
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        color: 'text-blue-700',
        border: 'border-l-blue-500',
        dot: 'bg-blue-500',
        pulse: true,
    },
    on_the_way: {
        label: 'On the way',
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        color: 'text-emerald-700',
        border: 'border-l-emerald-500',
        dot: 'bg-emerald-500',
        pulse: true,
    },
    arrived: {
        label: 'Reached location',
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        color: 'text-purple-700',
        border: 'border-l-purple-500',
        dot: 'bg-purple-500',
        pulse: false,
    },
    completed: {
        label: 'Completed',
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        color: 'text-gray-600',
        border: 'border-l-gray-400',
        dot: 'bg-gray-400',
        pulse: false,
    },
};

/** Ordered steps used by PatientTracking timeline */
export const STATUS_STEPS = [
    { key: 'pending',    label: 'Waiting for ambulance', color: 'text-amber-600',   bg: 'bg-amber-100'  },
    { key: 'accepted',   label: 'Ambulance assigned',    color: 'text-blue-600',    bg: 'bg-blue-100'   },
    { key: 'on_the_way', label: 'On the way',            color: 'text-emerald-600', bg: 'bg-emerald-100'},
    { key: 'arrived',    label: 'Reached location',      color: 'text-purple-600',  bg: 'bg-purple-100' },
    { key: 'completed',  label: 'Completed',             color: 'text-gray-600',    bg: 'bg-gray-100'   },
];

export const API_BASE = import.meta.env.VITE_API_BASE;

