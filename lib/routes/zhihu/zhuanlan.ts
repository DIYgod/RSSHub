// @ts-nocheck
import got from '@/utils/got';
const utils = require('./utils');
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('id');

    const listRes = await got({
        method: 'get',
        url: `https://www.zhihu.com/api/v4/columns/${id}/items`,
        headers: {
            ...utils.header,
            Referer: `https://zhuanlan.zhihu.com/${id}`,
        },
    });

    const pinnedRes = await got({
        method: 'get',
        url: `https://www.zhihu.com/api/v4/columns/${id}/pinned-items`,
        headers: {
            ...utils.header,
            Referer: `https://zhuanlan.zhihu.com/${id}`,
        },
    });

    listRes.data.data = [...listRes.data.data, ...pinnedRes.data.data];

    // 知乎专栏链接存在两种格式, 一种以 'zhuanlan.' 开头, 另一种新增的以 'c_' 结尾
    let url = `https://zhuanlan.zhihu.com/${id}`;
    if (id.search('c_') === 0) {
        url = `https://www.zhihu.com/column/${id}`;
    }

    const infoRes = await got(url);
    const $ = load(infoRes.data);
    const title = $('.css-zyehvu').text();
    const description = $('.css-1bnklpv').text();

    const item = listRes.data.data.map((item) => {
        // 当专栏内文章内容不含任何文字时, 返回空字符, 以免直接报错
        let description = '';
        if (item.content) {
            const $ = load(item.content);
            description = $.html();
        }
        $('img').css('max-width', '100%');

        let title = '';
        let link = '';
        let author = '';
        let pubDate = '';

        switch (item.type) {
            case 'answer':
                title = item.question.title;
                author = item.question.author ? item.question.author.name : '';
                link = `https://www.zhihu.com/question/${item.question.id}/answer/${item.id}`;
                pubDate = parseDate(item.created_time * 1000);

                break;

            case 'article':
                title = item.title;
                link = item.url;
                author = item.author.name;
                pubDate = parseDate(item.created * 1000);

                break;

            case 'zvideo':
                // 如果类型是zvideo，id即为视频地址参数
                title = item.title;
                link = `https://www.zhihu.com/zvideo/${item.id}`;
                author = item.author.name;
                pubDate = parseDate(item.created_at * 1000);
                // 判断是否存在视频简介
                description = item.description ? `${item.description} <br> <br> <a href="${link}">视频内容请跳转至原页面观看</a>` : `<a href="${link}">视频内容请跳转至原页面观看</a>`;

                break;

            default:
                throw new Error(`Unknown type: ${item.type}`);
        }
        return {
            title,
            link,
            description,
            pubDate,
            author,
        };
    });

    ctx.set('data', {
        description,
        item,
        title: `知乎专栏-${title}`,
        link: url,
    });
};
