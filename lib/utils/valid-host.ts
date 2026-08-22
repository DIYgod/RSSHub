/**
 * Check if a sub-domain is valid
 * @param {String} hostname sub-domain
 * @returns {Boolean} true if valid
 */
const isValidHost = (hostname?: string) => {
    const regex = /^[\dA-Z](?:[\dA-Z-]{0,61}[\dA-Z])?$/i;
    return regex.test(hostname ?? '');
};

export { isValidHost };
