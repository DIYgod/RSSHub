const got = require('@/utils/got');
const auth = require('./auth');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const xhuCookie = await auth.getCookie(ctx);
    const id = ctx.params.id;
    const link = `https://www.zhihu.com/column/${id}`;

    const titleResponse = await got({
        method: 'get',
        url: `https://api.zhihuvvv.workers.dev/columns/${id}`,
        headers: {
            Referer: 'https://api.zhihuvvv.workers.dev',
            Cookie: xhuCookie,
        },
    });

    const contentResponse = await got({
        method: 'get',
        url: `https://api.zhihuvvv.workers.dev/columns/${id}/articles?limit=20&offest=0`,
        headers: {
            Referer: 'https://api.zhihuvvv.workers.dev',
            Cookie: xhuCookie,
        },
    });

    const listRes = contentResponse.data.data;

    ctx.state.data = {
        title: `知乎专栏-${titleResponse.data.title}`,
        description: titleResponse.data.description,
        link,
        item: listRes.map((item) => {
            let description = '';
            if (item.content) {
                const $ = cheerio.load(item.content);
                $('img').css('max-width', '100%');
                description = $.html();
            }

            let title = '';
            let link = '';
            let author = '';
            let pubDate;

            // The xhu api only get items of type article.
            if (item.type === 'article') {
                title = item.title;
                link = item.url;
                author = item.author.name;
                pubDate = parseDate(item.created * 1000);
            } else if (item.type === 'answer') {
                title = item.question.title;
                author = item.question.author ? item.question.author.name : '';
                link = `https://www.zhihu.com/question/${item.question.id}/answer/${item.id}`;
                pubDate = parseDate(item.created_time * 1000);
            } else if (item.type === 'zvideo') {
                // 如果类型是zvideo，id即为视频地址参数
                title = item.title;
                link = `https://www.zhihu.com/zvideo/${item.id}`;
                author = item.author.name;
                pubDate = parseDate(item.created_at * 1000);
                // 判断是否存在视频简介
                if (item.description) {
                    description = `${item.description} <br> <br> <a href="${link}">视频内容请跳转至原页面观看</a>`;
                } else {
                    description = `<a href="${link}">视频内容请跳转至原页面观看</a>`;
                }
            }

            return {
                title,
                description,
                author,
                pubDate,
                guid: link,
                link,
            };
        }),
    };
};
