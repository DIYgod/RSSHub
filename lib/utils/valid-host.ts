/**
 * Check if a sub-domain is valid
 * @param {String} hostname sub-domain
 * @returns {Boolean} true if valid
 */
const isValidHost = (hostname?: string) => {
    const regex = /^[\dA-Z](?:[\dA-Z-]{0,61}[\dA-Z])?$/i;
    return regex.test(hostname ?? '');
};

/**
 * Whether a link is an http or https URL on one of the given sites, or on a subdomain of one. Check this before a route
 * requests or opens a link taken from an upstream page or API response.
 * @param link absolute URL
 * @param domains host names such as `example.com`
 */
const isOnSite = (link: string | undefined, ...domains: string[]) => {
    if (!link || !URL.canParse(link)) {
        return false;
    }
    const { protocol, hostname } = new URL(link);
    return ['http:', 'https:'].includes(protocol) && domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
};

export { isOnSite, isValidHost };
