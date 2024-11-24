import { config } from '@/config';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';
import { ofetch } from 'ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';

// Common headers for requests
const getHeaders = (cookie?: string) => ({
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    Host: 'www.xiaohongshu.com',
    Pragma: 'no-cache',
    'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    ...(cookie ? { Cookie: cookie } : {}),
});

const getUser = (url, cache) =>
    cache.tryGet(
        url,
        async () => {
            const browser = await puppeteer({
                stealth: true,
            });
            try {
                const page = await browser.newPage();
                await page.setRequestInterception(true);
                let collect = '';
                page.on('request', (request) => {
                    request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'xhr' || request.resourceType() === 'other' ? request.continue() : request.abort();
                });
                logger.http(`Requesting ${url}`);
                await page.goto(url, {
                    waitUntil: 'domcontentloaded',
                });
                await page.waitForSelector('div.reds-tab-item:nth-child(2)');

                const initialState = await page.evaluate(() => (window as any).__INITIAL_STATE__);

                if (!(await page.$('.lock-icon'))) {
                    await page.click('div.reds-tab-item:nth-child(2)');
                    try {
                        const response = await page.waitForResponse(
                            (res) => {
                                const req = res.request();
                                return req.url().includes('/api/sns/web/v2/note/collect/page') && req.method() === 'GET' && req.resourceType() === 'xhr';
                            },
                            { timeout: 5000 }
                        );
                        collect = await response.json();
                    } catch {
                        //
                    }
                }

                let { userPageData, notes } = initialState.user;
                userPageData = userPageData._rawValue || userPageData;
                notes = notes._rawValue || notes;

                return { userPageData, notes, collect };
            } finally {
                browser.close();
            }
        },
        config.cache.routeExpire,
        false
    );

const getBoard = (url, cache) =>
    cache.tryGet(
        url,
        async () => {
            const browser = await puppeteer();
            try {
                const page = await browser.newPage();
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'xhr' ? request.continue() : request.abort();
                });
                logger.http(`Requesting ${url}`);
                await page.goto(url);
                await page.waitForSelector('.pc-container');
                const initialSsrState = await page.evaluate(() => (window as any).__INITIAL_SSR_STATE__);
                return initialSsrState.Main;
            } finally {
                browser.close();
            }
        },
        config.cache.routeExpire,
        false
    );

const formatText = (text) => text.replaceAll(/(\r\n|\r|\n)/g, '<br>').replaceAll('\t', '&emsp;');

// tag_list.id has nothing to do with its url
const formatTagList = (tagList) => tagList.reduce((acc, item) => acc + `#${item.name} `, ``);

const formatImageList = (imageList) => imageList.reduce((acc, item) => acc + `<img src="${item.url}"><br>`, ``);

const formatNote = (url, note) => ({
    title: note.title,
    link: url + '/' + note.noteId,
    description: formatText(note.desc) + '<br><br>' + formatTagList(note.tagList) + '<br><br>' + formatImageList(note.imageList),
    author: note.user.nickname,
    pubDate: parseDate(note.time, 'x'),
    updated: parseDate(note.lastUpdateTime, 'x'),
});

async function renderNotesFulltext(notes, urlPrex) {
    const data: Array<{
        title: string;
        link: string;
        description: string;
        author: string;
        guid: string;
        pubDate: Date;
    }> = [];
    const promises = notes.flatMap((note) =>
        note.map(async ({ noteCard, id }) => {
            const link = `${urlPrex}/${id}`;
            const { title, description, pubDate } = await getFullNote(link);
            return {
                title,
                link,
                description,
                author: noteCard.user.nickName,
                guid: noteCard.noteId,
                pubDate,
            };
        })
    );
    data.push(...(await Promise.all(promises)));
    return data;
}

async function getFullNote(link) {
    const data = (await cache.tryGet(link, async () => {
        const res = await ofetch(link, {
            headers: getHeaders(config.xiaohongshu.cookie),
        });
        const $ = load(res);
        const script = extractInitialState($);
        const state = JSON.parse(script);
        const note = state.note.noteDetailMap[state.note.firstNoteId].note;
        const images = note.imageList.map((image) => image.urlDefault);
        const title = note.title;
        let desc = note.desc;
        desc = desc.replaceAll(/\[.*?\]/g, '');
        desc = desc.replaceAll(/#(.*?)#/g, '#$1');
        desc = desc.replaceAll('\n', '<br>');
        const pubDate = new Date(note.time);
        const description = `${images.map((image) => `<img src="${image}">`).join('')}<br>${title}<br>${desc}`;
        return {
            title,
            description,
            pubDate,
        };
    })) as Promise<{ title: string; description: string; pubDate: Date }>;
    return data;
}

async function getUserWithCookie(url: string, cookie: string) {
    const res = await ofetch(url, {
        headers: getHeaders(cookie),
    });
    const $ = load(res);
    const paths = $('#userPostedFeeds > section > div > a.cover.ld.mask').map((i, item) => item.attributes[3].value);
    const script = extractInitialState($);
    const state = JSON.parse(script);
    let index = 0;
    for (const item of state.user.notes.flat()) {
        const path = paths[index];
        if (path && path.includes('?')) {
            item.id = item.id + path?.substring(path.indexOf('?'));
        }
        index = index + 1;
    }
    return state.user;
}

// Add helper function to extract initial state
function extractInitialState($) {
    let script = $('script')
        .filter((i, script) => {
            const text = script.children[0]?.data;
            return text?.startsWith('window.__INITIAL_STATE__=');
        })
        .text();
    script = script.slice('window.__INITIAL_STATE__='.length);
    script = script.replaceAll('undefined', 'null');
    return script;
}

export { getUser, getBoard, formatText, formatNote, renderNotesFulltext, getFullNote, getUserWithCookie };
