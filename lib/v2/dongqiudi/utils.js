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

const ProcessFeed = async (ctx, link, type) => {
    const got_ins = got.extend({
        headers: {
            Referer: link,
        },
    });

    const response = await got_ins.get(link);

    let name;

    const dom = new JSDOM(response.data, {
        runScripts: 'dangerously',
    });

    const data = dom.window.__NUXT__.data[0];
    const list = data.relatedNewsList;

    if (type === 'team') {
        name = data.teamDetail.base_info.team_name;
    } else if (type === 'player') {
        name = data.playerDetail.base_info.person_name;
    }
    const proList = [];

    const out = await Promise.all(
        list.map((item) => {
            const title = item.title;
            const link = `https://www.dongqiudi.com/news/${item.id}.html`;

            return ctx.cache.tryGet(link, () => {
                const single = {
                    title,
                    link,
                };

                const es = got(link);
                proList.push(es);
                return single;
            });
        })
    );

    const responses = await got.all(proList);
    for (let i = 0; i < proList.length; i++) {
        ProcessFeedType2(out[i], responses[i].data);
    }

    ctx.state.data = {
        title: `${name} - 相关新闻`,
        link,
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
        item.pubDate = parseDate(data.show_time * 1000);
    }
};

module.exports = {
    ProcessVideo,
    ProcessFeed,
    ProcessFeedType2,
    ProcessHref,
    ProcessImg,
};
