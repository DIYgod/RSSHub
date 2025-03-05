/**
 * Get Cookie-header-style cookie string from a puppeteer-style cookie array
 *
 * @param {import('puppeteer').Protocol.Network.CookieParam[]} cookies Puppeteer-style cookie array
 * @param {RegExp | string} domainFilter Filter cookies by domain or RegExp
 * @return {string} Cookie-header-style cookie string (e.g. "foobar; foo=bar; baz=qux")
 */
const parseCookieArray = (cookies, domainFilter?: string | RegExp) => {
    if (typeof domainFilter === 'string') {
        const dotDomain = '.' + domainFilter;
        cookies = cookies.filter(({ domain }) => domain === domainFilter || domain.endsWith(dotDomain));
    } else if (domainFilter && domainFilter.test !== undefined) {
        cookies = cookies.filter(({ domain }) => domainFilter.test(domain));
    }
    // {name: '', value: 'foobar'} => 'foobar' // https://stackoverflow.com/questions/42531198/cookie-without-a-name
    // {name: 'foo', value: 'bar'} => 'foo=bar'
    return cookies.map(({ name, value }) => (name ? `${name}=${value}` : value)).join('; ');
};

/**
 * Construct a puppeteer-style cookie array from a Cookie-header-style cookie string
 *
 * @param {string} cookieStr Cookie-header-style cookie string (e.g. "foobar; foo=bar; baz=qux")
 * @param {string} domain Domain to set for each cookie
 * @return {import('puppeteer').Protocol.Network.CookieParam[]} Puppeteer-style cookie array
 */
const constructCookieArray = (cookieStr, domain) =>
    cookieStr.split('; ').map((item) => {
        const [name, value] = item.split('=');
        return value === undefined ? { name: '', value: name, domain } : { name, value, domain };
    });

/**
 * Set cookies for a page
 *
 * @param {import('puppeteer').Page} page Puppeteer Page object
 * @param {string} cookieStr Cookie-header-style cookie string (e.g. "foobar; foo=bar; baz=qux")
 * @param {string} domain Domain to set for each cookie
 * @return {Promise<void>}
 */
const setCookies = async (page, cookieStr, domain) => {
    const cookies = constructCookieArray(cookieStr, domain);
    await page.setCookie(...cookies);
};

/**
 * Get Cookie-header-style cookie string from a page
 *
 * @param {import('puppeteer').Page} page Puppeteer Page object
 * @param {RegExp | string} domainFilter Filter cookies by domain or RegExp
 * @return {Promise<string>} Cookie-header-style cookie string
 */
const getCookies = async (page, domainFilter?: string) => {
    const cookies = await page.cookies();
    return parseCookieArray(cookies, domainFilter);
};

export { parseCookieArray, constructCookieArray, setCookies, getCookies };
