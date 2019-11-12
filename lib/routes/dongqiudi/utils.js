const cheerio = require('cheerio');
const got = require('@/utils/got');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const ProcessVideo = (content) => {
    content('div.video').each((i, v) => {
        const link = v.attribs.src;
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
    });

    content('.edui-faked-video').each((i, e) => {
        content(e).remove();
    });

    return content;
};

const ProcessHref = (content) => {
    content.each((i, v) => {
        cheerio
            .load(v)('a')
            .each((j, y) => {
                if (y.attribs.href) {
                    y.attribs.href = y.attribs.href.replace('dongqiudi:///news', 'https://www.dongqiudi.com/share/article');
                }
            });
    });
    return content;
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
            const res = await got_ins.get(item.url);

            const $ = cheerio.load(res.data);

            const author = $('body > header a').text();

            const content = $('article');

            content.find('.data-gif-src').each((j, y) => {
                if (y.attribs['data-gif-src']) {
                    y.attribs = { src: y.attribs['data-gif-src'] };
                }
            });

            content.find('a').each((j, y) => {
                if (y.attribs.href) {
                    y.attribs.href = y.attribs.href.replace('dongqiudi:///news', 'https://www.dongqiudi.com/share/article');
                }
            });

            content.find('div.video').each((i, v) => {
                const link = v.attribs.src;
                switch (v.attribs.site) {
                    case 'qiniu':
                        $(`<video width="100%" controls="controls" source src="${link}" type="video/mp4"> Your RSS reader does not support video playback. </video>`).insertAfter(v);
                        $(v).remove();
                        break;
                    case 'youku':
                        $(`<iframe height='100%' width='100%' src='${link}' frameborder=0 scrolling=no webkitallowfullscreen=true allowfullscreen=true></iframe>`).insertAfter(v);
                        $(v).remove();
                        break;
                    default:
                        $(`<a href="${link}">观看视频</a>`).insertAfter(v);
                        $(v).remove();
                        break;
                }
            });

            content.find('.edui-faked-video').each((i, e) => {
                content(e).remove();
            });

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

module.exports = {
    ProcessVideo,
    ProcessFeed,
    ProcessHref,
};
