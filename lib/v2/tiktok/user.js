const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const baseUrl = 'https://www.tiktok.com';

module.exports = async (ctx) => {
    const { user } = ctx.params;

    let items = await ctx.cache.tryGet(
        `tiktok:user:${user}`,
        async () => {
            const browser = await require('@/utils/puppeteer')();
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                // blocking script reduces clips from 30 -> 16
                request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
            });
            await page.goto(`${baseUrl}/${user}`, {
                waitUntil: 'networkidle2',
            });
            const html = await page.evaluate(() => document.documentElement.innerHTML);
            browser.close();

            const $ = cheerio.load(html);

            return $('[class*=-DivItemContainerV2]')
                .toArray()
                .map((item) => ({ link: $(item).find('[class*=-DivWrapper] a').attr('href') }));
        },
        config.cache.routeExpire,
        false
    );

    let feedTitle;
    let feedDescription;
    let feedImage;

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const videoId = item.link.substring(item.link.lastIndexOf('/') + 1);
                    const api = (
                        await got(`${baseUrl}/node/share/video/${user}/${videoId}`, {
                            headers: {
                                referer: `${baseUrl}/${user}`,
                            },
                        })
                    ).data;

                    if (!feedTitle) {
                        feedTitle = `${api.itemInfo.itemStruct.author.nickname} (@${api.itemInfo.itemStruct.author.uniqueId}) TikTok | Watch ${api.itemInfo.itemStruct.author.nickname}'s Newest TikTok Videos`;
                    }
                    if (!feedDescription) {
                        feedDescription = api.itemInfo.itemStruct.author.signature;
                    }
                    if (!feedImage) {
                        feedImage = api.itemInfo.itemStruct.author.avatarLarger || api.itemInfo.itemStruct.author.avatarMedium || api.itemInfo.itemStruct.author.avatarThumb;
                    }

                    item.title = api.itemInfo.itemStruct.desc;
                    item.description = art(path.join(__dirname, 'templates/user.art'), {
                        poster: api.itemInfo.itemStruct.video.cover,
                        source: api.itemInfo.itemStruct.video.playAddr,
                    });
                    item.author = api.itemInfo.itemStruct.author.nickname;
                    item.pubDate = parseDate(api.itemInfo.itemStruct.createTime * 1000);
                } catch (e) {
                    item.title = 'Deleted clip';
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: feedTitle,
        description: feedDescription,
        image: feedImage,
        link: `${baseUrl}/${user}`,
        item: items,
    };
};
