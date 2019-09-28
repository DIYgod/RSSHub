const got = require('@/utils/got');
const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');

const ProcessFeed = ($, link) => {
    const title = $('h1').text();
    let content = $('div.story-container');

    // 处理封面图片
    content.find('div.story-image > figure').each((i, e) => {
        const src = `https://www.ft.com/__origami/service/image/v2/images/raw/${encodeURIComponent(e.attribs['data-url'])}?source=ftchinese&width=800&fit=cover`;

        $(`<img src=${src}>`).insertAfter(content.find('div.story-lead')[0]);
    });

    // 付费文章跳转
    content.find('div#subscribe-now-container').each((i, e) => {
        $(`<br/><p>此文章为付费文章，会员<a href='${link}'>请访问网站阅读</a>。</p>`).insertAfter(content.find('div.story-body')[0]);
        $(e).remove();
    });

    // 获取作者
    let author = '';
    content.find('span.story-author > a').each((i, e) => {
        author += `${$(e).text()} `;
    });
    author = author.trim();

    // 去除头部主题, 头部重复标题, 冗余元数据, 植入广告, 植入 js, 社交分享按钮, 底部版权声明, 空白 DOM
    content.find('div.story-theme, h1.story-headline, div.story-byline, div.mpu-container-instory,script, div#story-action-placeholder, div.copyrightstatement-container, div.clearfloat, div.o-ads').each((i, e) => {
        $(e).remove();
    });
    content = content.html();

    return { content, author, title };
};

const getData = async ({ site = 'www', channel }) => {
    let feed;

    if (channel) {
        channel = channel.toLowerCase();
        channel = channel.split('-').join('/');

        try {
            feed = await parser.parseURL(`http://${site}.ftchinese.com/rss/${channel}`);
        } catch (error) {
            return {
                title: `FT 中文网 ${channel} 不存在`,
                description: `FT 中文网 ${channel} 不存在`,
            };
        }
    } else {
        feed = await parser.parseURL(`http://${site}.ftchinese.com/rss/feed`);
    }

    const items = await Promise.all(
        feed.items.splice(0, 10).map(async (item) => {
            const response = await got.get(`${item.link}?full=y&archive`);

            const $ = cheerio.load(response.data);
            const result = ProcessFeed($, item.link);
            const single = {
                title: result.title,
                description: result.content,
                author: result.author,
                pubDate: item.pubDate,
                link: item.link,
            };
            return Promise.resolve(single);
        })
    );

    return {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
    };
};

module.exports = {
    getData,
};
