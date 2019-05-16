const dayjs = require('dayjs');
const cheerio = require('cheerio');
const axios = require('@/utils/axios');

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

const ProcessFeed = async (ctx, link, api) => {
    const axios_ins = axios.create({
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Referer: link,
        },
    });

    const response = await axios_ins.get(link);
    const $ = cheerio.load(response.data);
    const name = `${$('h1.name').text()} ${$('span.en_name').text()}`;

    const list = (await axios_ins.get(api)).data.data;
    const out = await Promise.all(
        list.map(async (item) => {
            const itemUrl = item.web_url;
            const res = await axios_ins.get(itemUrl);
            const content = ProcessVideo(cheerio.load(res.data));
            const serverOffset = new Date().getTimezoneOffset() / 60;
            const single = {
                title: content('h1').text(),
                guid: itemUrl,
                link: itemUrl,
                description: ProcessHref(content('#con > div.left > div.detail > div:nth-child(3)')).html(),
                pubDate: dayjs(content('#con h4 span.time').text())
                    .add(-8 - serverOffset, 'hour')
                    .toISOString(),
                author: content('#con h4 span.name').text(),
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
