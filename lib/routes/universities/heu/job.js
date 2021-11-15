import got from '~/utils/got.js';
import cheerio from 'cheerio';
import url from 'url';

const baseUrl = 'http://job.hrbeu.edu.cn';

const typeMap = {
    tzgg: {
        name: '通知公告',
        url: '/HrbeuJY/Web/Home/NewsList?43kuJdqqW6kyCmomBv0smMlyGfDy8QefMwSyc-jK8Ww=.shtml',
    },
};

export default async (ctx) => {
    const {
        type = 'tzgg'
    } = ctx.params;
    const link = baseUrl + typeMap[type].url;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: baseUrl,
        },
    });
    const $ = cheerio.load(response.data);

    const urlList = $('.wp_article_list .list_item')
        .slice(0, 10)
        .map((i, e) => $('a', e).attr('href'))
        .get();

    const titleList = $('.wp_article_list .list_item')
        .slice(0, 10)
        .map((i, e) => $('a', e).attr('title'))
        .get();

    const dateList = $('.wp_article_list .list_item')
        .slice(0, 10)
        .map((i, e) => $('.Article_PublishDate', e).text())
        .get();

    const out = await Promise.all(
        urlList.map(async (itemUrl, index) => {
            itemUrl = url.resolve(baseUrl, itemUrl);
            if (itemUrl.includes('.shtml')) {
                const cache = await ctx.cache.get(itemUrl);
                if (cache) {
                    return JSON.parse(cache);
                }
                const response = await got.get(itemUrl);
                const $ = cheerio.load(response.data);
                const single = {
                    title: titleList[index],
                    link: itemUrl,
                    description: $('.article')
                        .html()
                        .replace(/src="\//g, `src="${url.resolve(baseUrl, '.')}`)
                        .replace(/href="\//g, `href="${url.resolve(baseUrl, '.')}`)
                        .trim(),
                    pubDate: dateList[index],
                };
                ctx.cache.set(itemUrl, JSON.stringify(single));
                return single;
            } else {
                const single = {
                    title: titleList[index],
                    link: itemUrl,
                    description: '此链接为文件，请点击下载',
                    pubDate: dateList[index],
                };
                return single;
            }
        })
    );

    ctx.state.data = {
        title: 'HEU就业服务平台-' + typeMap[type].name,
        link,
        item: out,
    };
};
