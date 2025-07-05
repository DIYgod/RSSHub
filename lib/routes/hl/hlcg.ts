import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import puppeteer from '@/utils/puppeteer';
import logger from '@/utils/logger';

const getHlcg = async (category) => {
    const baseUrl = 'https://18hlw.com';
    const link = `${baseUrl}/${category}/`;
    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    // only allow certain types of requests to proceed
    page.on('request', (request) => {
        // in this case, we only allow document requests to proceed
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    logger.http(`Requesting ${link}`);
    await page.goto(link, {
        // specify how long to wait for the page to load
        waitUntil: 'load',
    });
    const response = await page.content();
    // close the tab
    page.close();

    const $ = load(response);

    const list = $('div.video-item')
        // We use the `toArray()` method to retrieve all the DOM elements selected as an array.
        .toArray()
        // We use the `map()` method to traverse the array and parse the data we need from each element.
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text().trim(),
                link: `${baseUrl}${a.attr('href')}`,
            };
        })
        .filter((item) => item.link.includes('archives') && item.title !== '热')
        .slice(0, 5);
    const results = [];

    for (const item of list) {
        // eslint-disable-next-line no-await-in-loop
        const result = await cache.tryGet(item.link, async () => {
            // highlight-start
            // reuse the browser instance and open a new tab
            const page = await browser.newPage();
            logger.http(`Requesting ${item.link}`);
            await page.setRequestInterception(true);
            // only allow certain types of requests to proceed
            page.on('request', (request) => {
                // in this case, we only allow document requests to proceed
                request.url().includes('.ts?auth_key=') ? request.abort() : request.continue();
            });
            await page.goto(item.link, { waitUntil: 'load' });
            const response = await page.content();
            // close the tab after retrieving the HTML content
            page.close();
            // highlight-end
            const $ = load(response);
            const published_time = $('meta[property="article:published_time"]').attr('content');

            const content = $('.client-only-placeholder').first();
            const videos = content.find('video');
            content.find('blockquote').remove();
            content.find('div').remove();
            let description = content.html();

            for (const video of videos.toArray()) {
                const videoElement = $(video);
                const m3u8Url = videoElement.attr('poster');
                if (m3u8Url) {
                    // console.log(`Found m3u8 URL: ${m3u8Url}`);
                    const videoStr = renderDPlayer(m3u8Url);
                    // console.log(`Rendering DPlayer for m3u8 URL: ${videoStr}`);
                    // replace the video element with a DPlayer player
                    description += videoStr;
                }
            }
            item.description = description;
            item.pubDate = parseDate(published_time);
            return item;
        });
        results.push(result);
    }

    browser.close();

    return {
        title: '最新黑料',
        link,
        item: results,
    };
};
function renderDPlayer(m3u8Url) {
    return `
    <iframe title="视频播放器" width="800" height="450"
    src="https://video-player-vert-two.vercel.app/player.html?url=${m3u8Url}"></iframe>
  <script>
    `;
}
export default getHlcg;
