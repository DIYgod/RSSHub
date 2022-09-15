const cheerio = require('cheerio');
const got = require('@/utils/got');
const { JSDOM } = require('jsdom');
const { parseDate } = require('@/utils/parse-date');

const ProcessVideo = (content) => {
    content('div.video').each((i, v) => {
        let link = new URL(v.attribs.src);
        if (link.host === 'm.miguvideo.com') {
            content(`<a href="${link.href}"> ▶️ 观看视频 </a><br>`).insertAfter(v);
            content(v).remove();
        } else {
            link = v.attribs.src;
            switch (v.attribs.site) {
                case 'qiniu':
                    content(`<video width="100%" controls="controls"> <source src="${link}" type="video/mp4"> Your RSS reader does not support video playback. </video>`).insertAfter(v);
                    content(v).remove();
                    break;
                case 'youku':
                    content(`<iframe height='100%' width='100%' src='${link}' frameborder=0 scrolling=no webkitallowfullscreen=true allowfullscreen=true></iframe>`).insertAfter(v);
                    content(v).remove();
                    break;
                default:
                    break;
            }
        }
    });

    // Process iframes
    content('iframe.media-iframe, .edui-faked-video').each((i, v) => {
        const link = v.attribs.src;
        if (link.startsWith('http://ssports.iqiyi.com/')) {
            content(`<a href="${link.link}"> ▶️ 观看视频 </a><br>`).insertAfter(v);
        }

        content(v).remove();
    });

    return content;
};

const ProcessHref = (content) => {
    content.each((j, y) => {
        if (y.attribs.href) {
            y.attribs.href = y.attribs.href.replace('dongqiudi:///news', 'https://www.dongqiudi.com/share/article');
        }
    });
};

const ProcessImg = (content) => {
    content.each((_, img) => {
        if (img.attribs['data-gif-src'] && img.attribs['data-gif-src'].length) {
            img.attribs = { src: img.attribs['data-gif-src'] };
        }
        if (img.attribs['orig-src'] && img.attribs['orig-src'].length) {
            img.attribs.src = img.attribs['orig-src'];
            delete img.attribs['orig-src'];
            delete img.attribs['data-src'];
        }
        img.attribs.src = img.attribs.src.includes('?watermark') ? img.attribs.src.split('?watermark')[0] : img.attribs.src;
    });
};

const ProcessFeed = async (ctx, type, id) => {
    const link = `https://www.dongqiudi.com/${type}/${id}.html`;
    const apiUrl = `https://api.dongqiudi.com/v3/archive/app/channel/feeds`;
    const { data: response } = await got(link);

    let name;

    const { window } = new JSDOM(response, {
        runScripts: 'dangerously',
    });

    const typeInfo = window.__NUXT__.data[0][`${type}Detail`].base_info;
    if (type === 'team') {
        name = typeInfo.team_name;
    } else if (type === 'player') {
        name = typeInfo.person_name;
    }

    const { data } = await got(apiUrl, {
        searchParams: {
            id,
            type,
            size: 20,
            platform: 'web',
            version: '',
        },
    });

    const list = data.data.articles.map((article) => ({
        title: article.title,
        link: `https://www.dongqiudi.com/articles/${article.id}.html`,
        category: [article.category, ...(article.secondary_category ? article.secondary_category : [])],
        pubDate: parseDate(article.show_time),
    }));

    const out = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);

                ProcessFeedType2(item, response);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${name} - 相关新闻`,
        link,
        image: type === 'team' ? typeInfo.team_logo : typeInfo.person_logo,
        item: out,
    };
};

const ProcessFeedType2 = (item, response) => {
    const dom = new JSDOM(response, {
        runScripts: 'dangerously',
    });

    const data = dom.window.__NUXT__.data[0].newData;

    // filter out undefined item
    if (!data) {
        return;
    }

    if (Object.keys(data).length > 0) {
        const body = ProcessVideo(cheerio.load(data.body));
        ProcessHref(body('a'));
        ProcessImg(body('img'));
        item.description = body.html();
        item.author = data.writer;
        item.pubDate = parseDate(data.show_time, 'X');
    }
};

module.exports = {
    ProcessVideo,
    ProcessFeed,
    ProcessFeedType2,
    ProcessHref,
    ProcessImg,
};
