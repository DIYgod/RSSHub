const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = async (ctx) => {
    const feed = await parser.parseURL('https://www.theverge.com/rss/index.xml');

    const items = await Promise.all(
        feed.items.splice(0, 10).map(async (item) => {
            const response = await axios({
                method: 'get',
                url: item.link,
            });

            const $ = cheerio.load(response.data);

            const content = $('div.c-entry-content');

            // 处理封面图片
            $('figure.e-image--hero picture > img').each((i, e) => {
                let src = e.attribs.srcset;
                src = src.match(/(?<=320w,).*?(?=620w)/g)[0].trim();

                $(`<img src='${src}'>`).insertBefore(content[0].childNodes[0]);
            });

            // 处理封面视频
            $('div.l-col__main > div.c-video-embed, div.c-entry-hero > div.c-video-embed').each((i, e) => {
                const src = `https://volume.vox-cdn.com/embed/${e.attribs['data-volume-uuid']}?autoplay=false`;

                $(`<iframe src="${src}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no"></iframe>`).insertBefore(content[0].childNodes[0]);
            });

            // 处理封面视频
            $('div.l-col__main > div.c-video-embed--media iframe').each((i, e) => {
                $(e).insertBefore(content[0].childNodes[0]);
            });

            // 处理文章图片
            content.find('figure.e-image').each((i, e) => {
                let src;

                // 处理 jpeg, png
                if ($(e).find('picture > source').length > 0) {
                    src = $(e)
                        .find('picture > img')[0]
                        .attribs.srcset.match(/(?<=320w,).*?(?=520w)/g)[0]
                        .trim();
                } else if ($(e).find('img.c-dynamic-image').length > 0) {
                    // 处理 gif
                    src = $(e).find('span.e-image__image')[0].attribs['data-original'];
                }

                $(`<img src='${src}'>`).insertBefore(e);
                $(e).remove();
            });

            // 移除无用 DOM
            content.find('aside').each((i, e) => {
                $(e).remove();
            });

            const single = {
                title: item.title,
                description: content.html(),
                author: item.author,
                pubDate: item.pubDate,
                link: item.link,
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
    };
};
