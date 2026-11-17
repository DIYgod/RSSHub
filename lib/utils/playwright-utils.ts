/**
 * Get Cookie-header-style cookie string from a browser cookie array.
 *
 * @param cookies Browser cookie array
 * @param {RegExp | string} domainFilter Filter cookies by domain or RegExp
 * @return {string} Cookie-header-style cookie string (e.g. "foobar; foo=bar; baz=qux")
 */
const parseCookieArray = (cookies, domainFilter?: string | RegExp) => {
    if (domainFilter instanceof RegExp) {
        cookies = cookies.filter(({ domain }) => domainFilter.test(domain));
    } else if (domainFilter) {
        const dotDomain = '.' + domainFilter;
        cookies = cookies.filter(({ domain }) => domain === domainFilter || domain.endsWith(dotDomain));
    }
    // {name: '', value: 'foobar'} => 'foobar' // https://stackoverflow.com/questions/42531198/cookie-without-a-name
    // {name: 'foo', value: 'bar'} => 'foo=bar'
    return cookies.map(({ name, value }) => (name ? `${name}=${value}` : value)).join('; ');
};

/**
 * Construct a browser cookie array from a Cookie-header-style cookie string.
 *
 * @param {string} cookieStr Cookie-header-style cookie string (e.g. "foobar; foo=bar; baz=qux")
 * @param {string} domain Domain to set for each cookie
 * @return Browser cookie array
 */
const constructCookieArray = (cookieStr, domain) =>
    cookieStr.split('; ').map((item) => {
        const [name, value] = item.split('=', 2);
        return value === undefined ? { name: '', value: name, domain, path: '/' } : { name, value, domain, path: '/' };
    });

/**
 * Set cookies for a page
 *
 * @param page Browser Page object
 * @param {string} cookieStr Cookie-header-style cookie string (e.g. "foobar; foo=bar; baz=qux")
 * @param {string} domain Domain to set for each cookie
 * @return {Promise<void>}
 */
const setCookies = async (page, cookieStr, domain) => {
    const cookies = constructCookieArray(cookieStr, domain);
    await page.context().addCookies(cookies);
};

/**
 * Get Cookie-header-style cookie string from a page
 *
 * @param page Browser Page object
 * @param {RegExp | string} domainFilter Filter cookies by domain or RegExp
 * @return {Promise<string>} Cookie-header-style cookie string
 */
const getCookies = async (page, domainFilter?: string) => {
    const cookies = await page.context().cookies();
    return parseCookieArray(cookies, domainFilter);
};

// upper bound on the size of a rendered document that is parsed further
const MAX_CONTENT_LENGTH = 4 * 1024 * 1024;

/**
 * Make `page.content()` reject when the rendered document is too large.
 *
 * @param page Browser Page object
 * @return {void}
 */
const limitContentLength = (page) => {
    const content = page.content.bind(page);
    page.content = async (...args) => {
        const html = await content(...args);
        if (html.length > MAX_CONTENT_LENGTH) {
            throw new Error(`${page.url()} rendered to ${html.length} characters, which is too large to parse`);
        }
        return html;
    };
};

/**
 * Make `page.goto()` open only web pages. Routes navigate to links taken from upstream pages, and a `file:` link would
 * otherwise tell the requester whether a local path exists.
 *
 * @param page Browser Page object
 * @return {void}
 */
const limitNavigation = (page) => {
    const goto = page.goto.bind(page);
    page.goto = (url: string, ...args) => {
        const { protocol } = new URL(url);
        if (!['http:', 'https:', 'about:'].includes(protocol)) {
            return Promise.reject(new Error(`page.goto: only web pages are opened, not ${protocol} URLs`));
        }
        return goto(url, ...args);
    };
};

export { constructCookieArray, getCookies, limitContentLength, limitNavigation, parseCookieArray, setCookies };
