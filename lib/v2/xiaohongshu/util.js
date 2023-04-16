const config = require('@/config').value;
const logger = require('@/utils/logger');
const { parseDate } = require('@/utils/parse-date');

const getUser = (url, cache) =>
    cache.tryGet(
        url,
        async () => {
            const browser = await require('@/utils/puppeteer')();
            try {
                const page = await browser.newPage();
                await page.setRequestInterception(true);
                let otherInfo = '';
                let user_posted = '';
                let collect = '';
                page.on('request', (request) => {
                    request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'xhr' || request.resourceType() === 'other' ? request.continue() : request.abort();
                });
                page.on('response', async (response) => {
                    const request = response.request();
                    if (request.url().includes('/api/sns/web/v1/user/otherinfo')) {
                        otherInfo = await response.json();
                    }
                    if (request.url().includes('/api/sns/web/v1/user_posted')) {
                        user_posted = await response.json();
                    }
                    if (request.url().includes('/api/sns/web/v2/note/collect/page')) {
                        collect = await response.json();
                    }
                });
                logger.debug(`Requesting ${url}`);
                await page.goto(url);
                await page.waitForSelector('.feeds-container:nth-child(1) .note-item');
                await page.click('div.reds-tab-item:nth-child(2)');
                await page.waitForSelector('.feeds-container:nth-child(2) .note-item');
                return { otherInfo, user_posted, collect };
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
            const browser = await require('@/utils/puppeteer')();
            try {
                const page = await browser.newPage();
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'xhr' ? request.continue() : request.abort();
                });
                logger.debug(`Requesting ${url}`);
                await page.goto(url);
                await page.waitForSelector('.pc-container');
                const initialSsrState = await page.evaluate(() => window.__INITIAL_SSR_STATE__);
                return initialSsrState.Main;
            } finally {
                browser.close();
            }
        },
        config.cache.routeExpire,
        false
    );

const getNotes = (url, cache) =>
    cache.tryGet(
        url,
        async () => {
            // Retry each request a few times until bypassing anti-crawler protection
            const TRY_LIMIT = 5;
            let tried = 0;

            // Randomly wait for 5 to 10 seconds to mimic human behavior
            const getWaitTime = () => (Math.random() * 5 + 5) * 1000;

            let user = '';
            const notes = [];

            const browser = await require('@/utils/puppeteer')({ stealth: true });
            try {
                const page = await browser.newPage();

                // Make viewport large enough to "click" successfully
                await page.setViewport({
                    width: 1920,
                    height: 1920,
                    deviceScaleFactor: 1,
                });

                logger.debug(`Requesting ${url}`);
                await page.goto(url);

                let userInfo = '';
                while (userInfo === '') {
                    if (tried >= TRY_LIMIT) {
                        throw `Could not get JSONs for user page`;
                    }

                    try {
                        // eslint-disable-next-line no-await-in-loop
                        userInfo = await Promise.all(
                            ['/api/sns/web/v1/user/otherinfo', '/api/sns/web/v1/user_posted'].map((p) =>
                                page
                                    .waitForResponse(
                                        // `!response.headers()['content-length']` to skip preflight requests
                                        (response) => response.url().includes(p) && !response.headers()['content-length'],
                                        { timeout: getWaitTime() }
                                    )
                                    .then((r) => r.json())
                            )
                        );
                    } catch (e) {
                        logger.debug(e);
                        tried++;
                        page.reload();
                    }
                }

                // Get the full text for each note
                // This should increase success rate, but it will make the fetching process slow
                // The original plan was to open several pages with notes' urls to get JSONs concurrently.
                // But I could not get the JSON needed in this way. So a more primitive approach is used.
                let i = 1;
                tried = 0;
                while (i <= userInfo[1].data.notes.length) {
                    if (tried >= TRY_LIMIT) {
                        throw `Could not get JSONs for a note`;
                    }

                    try {
                        // eslint-disable-next-line no-await-in-loop
                        await page.waitForSelector('.note-item', { timeout: getWaitTime() });
                        // eslint-disable-next-line no-await-in-loop
                        await page.click(`.note-item:nth-child(${i})`);

                        // eslint-disable-next-line no-await-in-loop
                        const response = await page.waitForResponse((response) => response.url().includes('/api/sns/web/v1/feed') && !response.headers()[`content-length`], { timeout: getWaitTime() });
                        // eslint-disable-next-line no-await-in-loop
                        const feed = await response.json();
                        notes.push(feed.data.items[0].note_card);

                        // eslint-disable-next-line no-await-in-loop
                        await page.click(`.close-box .close`);
                        // eslint-disable-next-line no-await-in-loop
                        await page.waitForNavigation({ timeout: getWaitTime() });
                        i++;
                        tried = 0;
                    } catch (e) {
                        tried++;
                        page.reload();
                    }
                }

                user = userInfo[0].data.basic_info;
            } finally {
                browser.close();
            }
            return { user, notes };
        },
        config.cache.routeExpire,
        false
    );

const formatText = (text) => text.replace(/(\r\n|\r|\n)/g, '<br>').replace(/(\t)/g, '&emsp;');

// tag_list.id has nothing to do with its url
const formatTagList = (tagList) => tagList.reduce((acc, item) => acc + `#${item.name} `, ``);

const formatImageList = (imageList) => imageList.reduce((acc, item) => acc + `<img src="${item.url}"><br>`, ``);

const formatNote = (url, note) => ({
    title: note.title,
    link: url + '/' + note.note_id,
    description: formatText(note.desc) + '<br>' + formatTagList(note.tag_list) + '<br><br>' + formatImageList(note.image_list),
    author: note.user.nickname,
    pubDate: parseDate(note.time, 'x'),
    updated: parseDate(note.last_update_time, 'x'),
});

module.exports = {
    getUser,
    getBoard,
    getNotes,
    formatText,
    formatNote,
};
