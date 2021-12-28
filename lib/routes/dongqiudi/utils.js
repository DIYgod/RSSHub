const cheerio = require('cheerio');
const got = require('@/utils/got');
const url = require('url');
const { JSDOM } = require('jsdom');

const ProcessVideo = (content) => {
    content('div.video').each((i, v) => {
        let link = url.parse(v.attribs.src);
        if (link.host === 'm.miguvideo.com') {
            content(`<a href="${link.href}"> ▶️ 观看视频 </a><br>`).insertAfter(v);
            content(v).remove();
        } else {
            link = v.attribs.src;
            switch (v.attribs.site) {
                case 'qiniu':
                    // 临时解决七牛 CDN 证书过期
                    link = link.replace('https://', 'http://');
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
        if (link.startsWith('http://ssports.iqiyi.com')) {
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

    const out = await Promise.all(
        list.map(async (item) => {
            const res = await got_ins.get(item.share.replace('www', 'm').replace('articles', 'article'));

            const $ = cheerio.load(res.data);

            const author = $('body > header a').text();

            const content = $('article');

            ProcessVideo($);

            $('.data-gif-src').each((j, y) => {
                if (y.attribs['data-gif-src']) {
                    y.attribs = { src: y.attribs['data-gif-src'] };
                }
            });

            ProcessHref(content.find('a'));

            const single = {
                title: item.title,
                guid: item.id,
                link: `https://www.dongqiudi.com/news/${item.id}.html`,
                description: content.html(),
                pubDate: new Date(item.show_time * 1000).toUTCString(),
                author,
            };
            return Promise.resolve(single);
        })
    );

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

    if (Object.keys(data).length > 0) {
        const body = ProcessVideo(cheerio.load(data.body));
        ProcessHref(body('a'));
        item.description = body.html();
        item.author = data.writer;
        item.pubDate = new Date(data.show_time * 1000).toUTCString();
    }
};

module.exports = {
    ProcessVideo,
    ProcessFeed,
    ProcessFeedType2,
    ProcessHref,
};
