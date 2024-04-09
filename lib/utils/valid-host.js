/**
 * Check if a sub-domain is valid
 * @param {String} hostname sub-domain
 * @returns {Boolean} true if valid
 */
const isValidHost = (hostname) => {
    if (typeof hostname !== 'string') {
        return false;
    }
    const regex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    return regex.test(hostname);
};

module.exports = {
    isValidHost,
};
