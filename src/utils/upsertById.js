/**
 * Replace the item with the same _id, or add it to the front if it is new.
 * Used for Socket.io updates, which carry both new and changed requests.
 */
const upsertById = (list, item) =>
    list.some(x => x._id === item._id)
        ? list.map(x => (x._id === item._id ? item : x))
        : [item, ...list];

export default upsertById;
