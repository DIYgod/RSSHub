import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getPuppeteerPage } from '@/utils/puppeteer';

const baseUrl = 'https://nhentai.net';

const getCookie = async (username, password, cache, force = false) => {
    const loginUrl = 'https://nhentai.net/login/';
    const cacheKey = 'nhentai:cookie';

    if (!force) {
        const cachedCookie = await cache.get(cacheKey);
        if (cachedCookie) {
            const { cookie, time } = JSON.parse(cachedCookie);
            const now = Date.now();
            if (cookie && now - time < 86400 * 30 * 1000) {
                return cookie;
            }
        }
    }

    const { page, destroy } = await getPuppeteerPage(loginUrl, {
        onBeforeLoad: async (page) => {
            const allowedTypes = new Set(['document', 'script', 'xhr', 'fetch', 'stylesheet']);
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                allowedTypes.has(request.resourceType()) ? request.continue() : request.abort();
            });
        },
        gotoConfig: { waitUntil: 'domcontentloaded' },
    });

    try {
        await new Promise((resolve) => setTimeout(resolve, 5000));

        let currentUrl = page.url();
        let title = await page.title();

        let attempts = 0;
        // eslint-disable-next-line no-await-in-loop
        while ((title.includes('Just a moment') || currentUrl.includes('challenges.cloudflare')) && attempts < 10) {
            // eslint-disable-next-line no-await-in-loop
            await new Promise((resolve) => setTimeout(resolve, 3000));
            currentUrl = page.url();
            // eslint-disable-next-line no-await-in-loop
            title = await page.title();
            attempts++;
        }

        if (title.includes('Just a moment')) {
            await destroy();
            return '';
        }

        await page.waitForSelector('input[name="username_or_email"]', { timeout: 30000 });
        await page.type('input[name="username_or_email"]', username);
        await page.type('input[name="password"]', password);

        const submitButton = await page.$('button[type="submit"]');
        if (!submitButton) {
            await destroy();
            return '';
        }

        try {
            await Promise.race([
                Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }), submitButton.click()]),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Navigation timeout')), 35000)),
            ]);
        } catch {
            // Continue anyway
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));

        currentUrl = page.url();
        title = await page.title();

        if (currentUrl.includes('/login') || title.includes('Login')) {
            await destroy();
            cache.set(
                cacheKey,
                JSON.stringify({
                    cookie: '',
                    time: Date.now(),
                })
            );
            return '';
        }

        const cookies = await page.cookies();
        const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join('; ');

        await destroy();

        cache.set(
            cacheKey,
            JSON.stringify({
                cookie: cookieString,
                time: Date.now(),
            })
        );

        return cookieString;
    } catch (error) {
        await destroy();
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (errorMsg.includes('detached') || errorMsg.includes('Navigating') || errorMsg.includes('Timeout') || errorMsg.includes('timeout')) {
            throw new Error(`Network/Cloudflare error: ${errorMsg}`, { cause: error });
        }

        cache.set(
            cacheKey,
            JSON.stringify({
                cookie: '',
                time: Date.now(),
            })
        );
        return '';
    }
};

const fetchPage = async (url: string): Promise<string> => {
    try {
        return await ofetch(url);
    } catch (error: unknown) {
        const status = (error as { status?: number; statusCode?: number }).status ?? (error as { status?: number; statusCode?: number }).statusCode;
        if (status === 403) {
            const { page, destroy } = await getPuppeteerPage(url, {
                onBeforeLoad: async (page) => {
                    const allowedTypes = new Set(['document', 'script', 'xhr', 'fetch']);
                    await page.setRequestInterception(true);
                    page.on('request', (request) => {
                        allowedTypes.has(request.resourceType()) ? request.continue() : request.abort();
                    });
                },
            });
            const content = await page.content();
            await destroy();
            return content;
        }
        throw error;
    }
};

const getSimple = async (url) => {
    const data = await fetchPage(url);
    const $ = load(data);

    return $('.gallery a.cover')
        .toArray()
        .map((ele) => parseSimpleDetail($(ele)));
};

const getDetails = (cache, simples, limit) => Promise.all(simples.slice(0, limit).map((simple) => cache.tryGet(simple.link, () => getDetail(simple))));

const getTorrents = async (cache, simples, limit) => {
    if (!config.nhentai || !config.nhentai.username || !config.nhentai.password) {
        throw new ConfigNotFoundError('nhentai RSS with torrents is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    const { username, password } = config.nhentai;

    let cookie;
    try {
        cookie = await getCookie(username, password, cache);
    } catch {
        throw new Error('nhentai login failed: Access denied by Cloudflare protection. Please try again later or configure a proxy.');
    }

    if (!cookie) {
        throw new ConfigNotFoundError('Invalid username (or email) or password for nhentai torrent download');
    }

    try {
        return await getTorrentWithCookie(cache, simples, cookie, limit);
    } catch (error) {
        if (error instanceof Error && error.message === 'Cookie expired or invalid') {
            cookie = await getCookie(username, password, cache, true);
            if (!cookie) {
                throw new ConfigNotFoundError('Invalid username (or email) or password for nhentai torrent download');
            }
            return getTorrentWithCookie(cache, simples, cookie, limit);
        }
        throw error;
    }
};
const getTorrentWithCookie = (cache, simples, cookie, limit) => Promise.all(simples.slice(0, limit).map((simple) => cache.tryGet(simple.link + 'download', () => getTorrent(simple, cookie))));

const parseSimpleDetail = ($ele) => {
    const link = new URL($ele.attr('href'), baseUrl).href;
    const thumb = $ele.children('img');
    const thumbSrc = thumb.attr('data-src') || thumb.attr('src');
    const highResoThumbSrc = thumbSrc
        .replace('thumb', '1')
        .replace(/t(\d+)\.nhentai\.net/, 'i$1.nhentai.net')
        .replace('.webp.webp', '.webp');
    return {
        title: $ele.children('.caption').text(),
        link,
        description: `<img src="${highResoThumbSrc}">`,
    };
};

const getTorrent = async (simple, cookie) => {
    const { link } = simple;
    const downloadUrl = link + 'download';

    const cookiesToSet = cookie.split('; ').map((c) => {
        const [name, ...valueParts] = c.split('=');
        return {
            name: name.trim(),
            value: valueParts.join('=').trim(),
            domain: '.nhentai.net',
            path: '/',
        };
    });

    const { page, destroy } = await getPuppeteerPage(downloadUrl, {
        onBeforeLoad: async (page) => {
            await page.setCookie(...cookiesToSet);
            const allowedTypes = new Set(['document', 'script', 'xhr', 'fetch']);
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                allowedTypes.has(request.resourceType()) ? request.continue() : request.abort();
            });
        },
        gotoConfig: { waitUntil: 'domcontentloaded' },
    });

    const content = await page.content();
    const currentUrl = page.url();
    await destroy();

    if (currentUrl.includes('/login')) {
        throw new Error('Cookie expired or invalid');
    }

    const $ = load(content);

    let enclosureUrl = '';

    const torrentLink = $('a[href$=".torrent"]').attr('href');
    if (torrentLink) {
        enclosureUrl = torrentLink.startsWith('http') ? torrentLink : new URL(torrentLink, baseUrl).href;
    }

    if (!enclosureUrl) {
        const magnetLink = $('a[href^="magnet:"]').attr('href');
        if (magnetLink) {
            enclosureUrl = magnetLink;
        }
    }

    if (!enclosureUrl) {
        const downloadLink = $('a[href*="download"]').attr('href');
        if (downloadLink) {
            enclosureUrl = downloadLink.startsWith('http') ? downloadLink : new URL(downloadLink, baseUrl).href;
        }
    }

    if (!enclosureUrl) {
        const galleryId = link.match(/\/g\/(\d+)/)?.[1];
        if (galleryId) {
            enclosureUrl = `${baseUrl}/download/${galleryId}`;
        }
    }

    return {
        ...simple,
        enclosure_url: enclosureUrl,
        enclosure_type: 'application/x-bittorrent',
    };
};

const getDetail = async (simple) => {
    const { link } = simple;
    const data = await fetchPage(link);
    const $ = load(data);

    const galleryImgs = $('.gallerythumb img')
        .toArray()
        .map((ele) => {
            const img = $(ele);
            const src = img.attr('data-src') || img.attr('src');
            return src ? new URL(src, baseUrl).href : null;
        })
        .filter((src) => src !== null)
        .map((src) => src.replace(/(.+)(\d+)t\.(.+)/, (_, p1, p2, p3) => `${p1}${p2}.${p3}`))
        .map((src) => src.replace(/t(\d+)\.nhentai\.net/, 'i$1.nhentai.net'))
        .map((src) => src.replace(/\.(jpg|png|gif)\.webp$/, '.$1'))
        .map((src) => src.replace(/\.webp\.webp$/, '.webp'));

    return {
        ...simple,
        title: $('div#info > h2').text() || $('div#info > h1').text(),
        pubDate: parseDate($('time').attr('datetime') || ''),
        description: renderDescription(galleryImgs.length, galleryImgs),
    };
};

const renderDescription = (length: number, images: string[]): string =>
    renderToString(
        <>
            <h1>{length} pages</h1>
            <br />
            {images.map((image, index) => (
                <span key={`${image}-${index}`}>
                    <img src={image} />
                    <br />
                </span>
            ))}
        </>
    );

export { baseUrl, getDetails, getSimple, getTorrents };
