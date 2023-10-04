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
                let collect = '';
                page.on('request', (request) => {
                    request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'xhr' || request.resourceType() === 'other' ? request.continue() : request.abort();
                });
                logger.debug(`Requesting ${url}`);
                await page.goto(url, {
                    waitUntil: 'domcontentloaded',
                });
                await page.waitForSelector('div.reds-tab-item:nth-child(2)');
                await page.click('div.reds-tab-item:nth-child(2)');
                const response = await page.waitForResponse((res) => {
                    const req = res.request();
                    return req.url().includes('/api/sns/web/v2/note/collect/page') && req.method() === 'GET' && req.resourceType() === 'xhr';
                });
                collect = await response.json();

                const initialState = await page.evaluate(() => window.__INITIAL_STATE__);

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
        url + '/notes', // To avoid mixing with the cache for `user.js`
        async () => {
            let user = '';
            let notes = [];

            const setPageFilter = async (page) => {
                await page.setRequestInterception(true);
                page.on('request', (req) => {
                    req.resourceType() === 'document' || req.resourceType() === 'script' || req.resourceType() === 'xhr' || req.resourceType() === 'other' ? req.continue() : req.abort();
                });
            };

            const browser = await require('@/utils/puppeteer')({ stealth: true });
            try {
                const page = await browser.newPage();
                await setPageFilter(page);

                logger.debug(`Requesting ${url}`);
                await page.goto(url);

                let otherInfo = {};
                let userPosted = {};
                try {
                    [otherInfo, userPosted] = await Promise.all(
                        ['/api/sns/web/v1/user/otherinfo', '/api/sns/web/v1/user_posted'].map((p) =>
                            page
                                .waitForResponse((res) => {
                                    const req = res.request();
                                    return req.url().includes(p) && req.method() === 'GET';
                                })
                                .then((r) => r.json())
                        )
                    );
                } catch (e) {
                    throw Error(`Could not get user information and note list\n${e}`);
                }

                await page.close();

                // Get full text for each note
                const notesPromise = userPosted.data.notes.map((n) => {
                    const noteUrl = url + '/' + n.note_id;

                    return cache.tryGet(noteUrl, async () => {
                        const notePage = await browser.newPage();
                        await setPageFilter(notePage);

                        logger.debug(`Requesting ${noteUrl}`);
                        await notePage.goto(noteUrl);

                        let feed = {};
                        try {
                            feed = await notePage.evaluate(() => window.__INITIAL_STATE__);

                            // Sometimes the page is not server-side rendered
                            if (typeof feed?.note?.note === 'undefined' || JSON.stringify(feed?.note?.note) === '{}') {
                                const res = await notePage.waitForResponse((res) => {
                                    const req = res.request();
                                    return req.url().includes('/api/sns/web/v1/feed') && req.method() === 'POST';
                                });

                                const json = await res.json();
                                const note_card = json.data.items[0].note_card;
                                feed.note.note = {
                                    title: note_card.title,
                                    noteId: note_card.id,
                                    desc: note_card.desc,
                                    tagList: note_card.tag_list,
                                    imageList: note_card.image_list,
                                    user: note_card.user,
                                    time: note_card.time,
                                    lastUpdateTime: note_card.last_update_time,
                                };
                            }
                        } catch (e) {
                            throw Error(`Could not get note ${n.note_id}\n${e}`);
                        }

                        await notePage.close();

                        if (typeof feed?.note?.note !== 'undefined' && JSON.stringify(feed?.note?.note) !== '{}') {
                            return feed.note.note;
                        } else {
                            throw Error(`Could not get note ${n.note_id}`);
                        }
                    });
                });

                user = otherInfo.data.basic_info;
                notes = await Promise.all(notesPromise);
            } finally {
                await browser.close();
            }

            return { user, notes };
        },
        config.cache.routeExpire,
        false
    );

const formatText = (text) => text.replace(/(\r\n|\r|\n)/g, '<br>').replace(/\t/g, '&emsp;');

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

module.exports = {
    getUser,
    getBoard,
    getNotes,
    formatText,
    formatNote,
};
