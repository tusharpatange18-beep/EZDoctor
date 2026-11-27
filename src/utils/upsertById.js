/**
 * Replace the item with the same _id, or add it to the front if it is new.
 * Used for Socket.io updates, which carry both new and changed requests.
 * Always returns a NEW list: React only redraws when state is a different object.
 */
function upsertById(list, item) {
    const result = [];
    let found = false;
    for (const current of list) {
        if (current._id === item._id) {
            result.push(item); // the updated version
            found = true;
        } else {
            result.push(current);
        }
    }
    if (!found) {
        result.unshift(item); // new item: put it first, so the newest request is on top
    }
    return result;
}

export default upsertById;
