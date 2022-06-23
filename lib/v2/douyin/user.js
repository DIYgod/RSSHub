const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const config = require('@/config').value;
const { fallback, queryToBoolean } = require('@/utils/readable-social');

const templates = {
    desc: path.join(__dirname, 'templates/desc.art'),
    cover: path.join(__dirname, 'templates/cover.art'),
    embed: path.join(__dirname, 'templates/embed.art'),
    iframe: path.join(__dirname, 'templates/iframe.art'),
};

const resolveUrl = (url, tls = true, forceResolve = false) => {
    if (!url) {
        return '';
    }
    if (url.startsWith('//')) {
        return (tls ? 'https:' : 'http:') + url;
    }
    if (forceResolve && !url.match(/^https?:\/\//)) {
        return (tls ? 'https://' : 'http://') + url;
    }
    return url;
};

const proxyVideo = (url, proxy) => {
    if (!(url && proxy)) {
        return url + '';
    }
    if (proxy.includes('?')) {
        if (!proxy.endsWith('=')) {
            proxy += '=';
        }
        return proxy + encodeURIComponent(url);
    } else {
        if (!proxy.endsWith('/')) {
            proxy += '/';
        }
        return proxy + url;
    }
};

const getOriginAvatar = (url) =>
    resolveUrl(url)
        .replace(/^(.*\.douyinpic\.com\/).*(\/aweme-avatar\/)([^?]*)(\?.*)?$/, '$1origin$2$3')
        .replace(/~\w+_\d+x\d+/g, '');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    if (!uid.startsWith('MS4wLjABAAAA')) {
        throw Error('Invalid UID. UID should start with <b>MS4wLjABAAAA</b>.');
    }
    const routeParams = Object.fromEntries(new URLSearchParams(ctx.params.routeParams));
    const embed = fallback(undefined, queryToBoolean(routeParams.embed), false); // embed video
    const iframe = fallback(undefined, queryToBoolean(routeParams.iframe), false); // embed video in iframe
    const relay = resolveUrl(routeParams.relay, true, true); // embed video behind a reverse proxy

    const pageUrl = `https://www.douyin.com/user/${uid}`;

    const pageData = await ctx.cache.tryGet(
        `douyin:user:${uid}`,
        async () => {
            const browser = await require('@/utils/puppeteer')();
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' ? request.continue() : request.abort();
            });
            await page.goto(pageUrl, {
                waitUntil: 'domcontentloaded',
            });
            const html = await page.evaluate(() => document.documentElement.innerHTML);
            await browser.close();

            const $ = cheerio.load(html);
            const renderData = JSON.parse(decodeURIComponent($('script#RENDER_DATA').html()));
            const dataKey = Object.keys(renderData).filter((key) => renderData[key].user && renderData[key].post)[0];
            return renderData[dataKey];
        },
        config.cache.routeExpire,
        false
    );

    const userInfo = pageData.user.user;
    const userNickName = userInfo.nickname;
    const userDescription = userInfo.desc;
    const userAvatar = getOriginAvatar(userInfo.avatar300Url || userInfo.avatarUrl);

    const posts = pageData.post.data;
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
        };
    });

    ctx.state.data = {
        title: userNickName,
        description: userDescription,
        image: userAvatar,
        link: pageUrl,
        item: items,
    };
};
