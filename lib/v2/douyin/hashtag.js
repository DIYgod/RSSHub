const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const config = require('@/config').value;
const { fallback, queryToBoolean } = require('@/utils/readable-social');
const { templates, resolveUrl, proxyVideo, getOriginAvatar } = require('./utils');

module.exports = async (ctx) => {
    const { cid } = ctx.params;
    if (isNaN(cid)) {
        throw Error('Invalid tag ID. Tag ID should be a number.');
    }
    const routeParams = Object.fromEntries(new URLSearchParams(ctx.params.routeParams));
    const embed = fallback(undefined, queryToBoolean(routeParams.embed), false); // embed video
    const iframe = fallback(undefined, queryToBoolean(routeParams.iframe), false); // embed video in iframe
    const relay = resolveUrl(routeParams.relay, true, true); // embed video behind a reverse proxy

    const tagUrl = `https://www.douyin.com/hashtag/${cid}`;

    const tagData = await ctx.cache.tryGet(
        `douyin:hashtag:${cid}`,
        async () => {
            const browser = await require('@/utils/puppeteer')();
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' ? request.continue() : request.abort();
            });
            await page.goto(tagUrl, {
                waitUntil: 'domcontentloaded',
            });
            await page.waitForSelector('#RENDER_DATA');
            const html = await page.evaluate(() => document.documentElement.innerHTML);
            await browser.close();

            const $ = cheerio.load(html);
            const renderData = JSON.parse(decodeURIComponent($('script#RENDER_DATA').text()));
            const dataKey = Object.keys(renderData).find((key) => renderData[key].topicDetail && renderData[key].defaultData);
            return renderData[dataKey];
        },
        config.cache.routeExpire,
        false
    );

    const tagInfo = tagData.topicDetail;
    const tagName = tagInfo.chaName;
    const userAvatar = getOriginAvatar(tagInfo.hashtagProfile);

    const posts = tagData.defaultData;
    const items = posts.map((post) => {
        // parse video
        let videoList = post.video && post.video.bitRateList && post.video.bitRateList.map((item) => resolveUrl(item.playApi));
        if (relay) {
            videoList = videoList.map((item) => proxyVideo(item, relay));
        }
        let duration = post.video && post.video.duration;
        duration = duration && duration / 1000;
        let img;
        // if (!embed) {
        //     img = post.video && post.video.dynamicCover; // dynamic cover (webp)
        // }
        img =
            img ||
            (post.video &&
                ((post.video.coverUrlList && post.video.coverUrlList[post.video.coverUrlList.length - 1]) || // HD
                    post.video.originCover || // LD
                    post.video.cover)); // even more LD
        img = img && resolveUrl(img);

        // render description
        const desc = post.desc && post.desc.replace(/\n/g, '<br>');
        let media = art(embed && videoList ? templates.embed : templates.cover, { img, videoList, duration });
        media = embed && videoList && iframe ? art(templates.iframe, { content: media }) : media; // warp in iframe
        const description = art(templates.desc, { desc, media });

        return {
            title: post.desc,
            description,
            link: `https://www.douyin.com/video/${post.awemeId}`,
            pubDate: parseDate(post.createTime * 1000),
            category: post.textExtra.map((extra) => extra.hashtagName),
            author: post.authorInfo.nickname,
        };
    });

    ctx.state.data = {
        title: tagName,
        description: `${tagInfo.viewCount} 次播放`,
        image: userAvatar,
        link: tagUrl,
        item: items,
    };
};
