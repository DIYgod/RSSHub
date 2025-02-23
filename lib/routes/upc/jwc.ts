// 导入必要的模组
import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import timezone from '@/utils/timezone';

const typeDict = {
    tzgg: '', // 默认为所有通知
    '18519': '教学·运行-', // 教学·运行
    '18520': '学业·学籍-', // 学业·学籍
    '18521': '教学·研究-', // 教学·研究
    '18522': '课程·教材-', // 课程·教材
    '18523': '实践·教学-', // 实践·教学
    '18524': '创新·创业-', // 创新·创业
    yywwz: '语言·文字-', // 语言·文字
    jxwjy: '继续·教育-', // 继续·教育
    bkwzs: '本科·招生-', // 本科·招生
};

// module.exports = async (ctx) => {
const handler = async (ctx) => {
    // 从 URL 参数中获取通知分类
    const { type = 'tzgg' } = ctx.req.param();
    // console.log(type);
    const baseUrl = 'https://jwc.upc.edu.cn';
    const { data: response } = await got(`${baseUrl}/${type}/list.htm`);
    // console.log(`${baseUrl}/${typeDict[type]}/list.htm`);
    const $ = load(response);
    // const listItems = $('ul.news_list').find('li');
    // console.log(`List item count: ${listItems.length}`);
    // const list = $('ul.news_list')  只会得到第一个li
    const list = $('ul.news_list')
        .find('li')
        // 使用“toArray()”方法将选择的所有 DOM 元素以数组的形式返回。
        .toArray()
        // 使用“map()”方法遍历数组，并从每个元素中解析需要的数据。
        .map((item) => {
            // console.log(item);
            item = $(item);
            const a = item.find('a').first();
            let linkStr = a.attr('href');
            // 若链接不是以http开头，则加上前缀
            if (a.attr('href').startsWith('http://')) {
                // 改为https访问
                linkStr.replace('http://', 'https://');
            } else {
                linkStr = `${baseUrl}${a.attr('href')}`;
            }
            return {
                title: a.text(),
                link: linkStr,
                pubDate: timezone(parseDate(item.find('.news_meta').text()), +8), // 添加发布日期查询
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                // 选择类名为“comment-body”的第一个元素
                item.description = $('.read').first().html();
                // item.pubDate = $('.arti_update').html() === null ? '' : $('.arti_update').html().slice(5, 15);
                // item.publisher = $('.arti_publisher').html();
                item.author = $('.arti_publisher').html();
                // console.log($('.arti_update').html().slice(5, 15));
                // 上面每个列表项的每个属性都在此重用，
                // 并增加了一个新属性“description”
                return item;
            })
        )
    );

    /*     ctx.state.data = {
        // 源标题
        title: `${typeDict[type]}教务处通知-中国石油大学（华东）`,
        // 源链接
        link: `https://jwc.upc.edu.cn/tzgg/list.htm`,
        // 源文章
        item: items,
    }; */

    return {
        // 源标题
        title: `${typeDict[type]}教务处通知-中国石油大学（华东）`,
        // 源链接
        link: `${baseUrl}/${type}/list.htm`,
        // 源文章
        item: items,
    };
};

export const route: Route = {
    path: '/jwc/:type?',
    categories: ['university'],
    example: '/upc/jwc/tzgg',
    parameters: { type: '分类，见下表，其值与对应网页url路径参数一致，默认为所有通知' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['jwc.upc.edu.cn', 'jwc.upc.edu.cn/:type/list.htm'],
            target: '/jwc/:type?',
        },
    ],
    name: '教务处通知公告',
    maintainers: ['sddzhyc'],
    description: `| 所有通知 | 教学·运行 | 学业·学籍 | 教学·研究 | 课程·教材 | 实践·教学 | 创新·创业 | 语言·文字 | 继续·教育 | 本科·招生 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| tzgg     | 18519    | 18520   | 18521    |    18522 |    18523 | 18524    |  yywwz   |  jxwjy   |   bkwzs  |`,
    url: 'jwc.upc.edu.cn/tzgg/list.htm',
    handler,
};
