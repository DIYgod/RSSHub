const config = require('@/config').value;
const logger = require('@/utils/logger');

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
            let notes = '';

            const browser = await require('@/utils/puppeteer')({ stealth: true });
            try {
                const page = await browser.newPage();
                logger.debug(`Requesting ${url}`);

                let userInfo = '';
                while (userInfo === '') {
                    if (tried >= TRY_LIMIT) {
                        throw `Could not get JSONs for user page`;
                    }

                    try {
                        // eslint-disable-next-line no-await-in-loop
                        await page.goto(url);
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
                    } finally {
                        tried++;
                    }
                }

                user = userInfo[0].data.basic_info;
                notes = userInfo[1].data.notes;
            } finally {
                browser.close();
            }

            return { user, notes };
        },
        config.cache.routeExpire,
        false
    );

const formatText = (text) => text.replace(/(\r\n|\r|\n)/g, '<br>').replace(/\t/g, '&emsp;');

const formatImageList = (imageList) => imageList.reduce((acc, item) => acc + `<img src="${item.url}"><br>`, ``);

const formatNote = (url, note) => ({
    title: note.display_title,
    link: url + '/' + note.note_id,
    description: note.display_title + '<br><br>' + formatImageList([note.cover]),
    author: note.user.nickname,
});

module.exports = {
    getUser,
    getBoard,
    getNotes,
    formatText,
    formatNote,
};
