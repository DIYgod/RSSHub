// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const title_map = {
    tzgg: '通知公告',
    zsxx: '硕士招生信息',
    pyxx: '研究生培养信息',
};
const description_map = {
    tzgg: '通知公告',
    zsxx: '硕士招生信息',
    pyxx: '研究生培养信息',
};
const url_map = {
    tzgg: 'tzgg',
    zsxx: 'zsxx/sszsxx',
    pyxx: 'pyxx/pyxx',
};

export default async (ctx) => {
    const type = ctx.req.param('type');
    const response = await got(`https://yjsy.ncepu.edu.cn/${url_map[type]}/index.htm`);
    const data = response.data; // 获取页面 html 数据

    const $ = load(data);
    const list = $('.articleList ul li')
        .map((_, item) => {
            item = $(item);
            // 单篇文章块的信息，其中文字部分是标题，属性是文章链接
            const a = item.find('a');
            // 发表日期
            const pubDate = timezone(parseDate(item.find('span').text().replace('[', '').replace(']', '')), +8);
            // 相对地址转化为绝对地址
            const url_head = `https://yjsy.ncepu.edu.cn/${url_map[type]}/`;
            const url_part = a.attr('href');
            const url = url_head + url_part;
            // 返回格式化数据
            return {
                title: a.attr('title'),
                link: url,
                pubDate,
            };
        })
        .get();

    const items = await Promise.all(
        list.map(async (item) => {
            const itemData = await cache.tryGet(item.link, async () => (await got(item.link)).data);
            const content = load(itemData);

            const articleAuthor = content('.articleAuthor').html().replace('作者：&nbsp;&nbsp;', '').replace('来源：&nbsp;&nbsp;', '');
            const eDescription = content('.article').html();
            const files = content('.Annex').html() || '';

            const single = {
                title: item.title,
                link: item.link,
                description: articleAuthor + eDescription + files,
                pubDate: item.pubDate,
            };
            return single;
        })
    );

    ctx.set('data', {
        title: `${title_map[type]}-华北电力大学研究生院`,
        link: `http://yjsy.ncepu.edu.cn/${url_map[type]}`,
        description: `华北电力大学研究生院${description_map[type]}`,
        item: items,
    });
};
