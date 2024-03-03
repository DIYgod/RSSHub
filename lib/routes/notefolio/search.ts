// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

// 导入所需模组
import got from '@/utils/got'; // 自订的 got
import { parseDate } from '@/utils/parse-date';
const dayjs = require('dayjs');
import * as path from 'node:path';
import { art } from '@/utils/render';

// 分类
const categoryMap = [
    {
        keywords: 'video-motiongraphic',
        category: 'portfolio.category.trevorbenitez',
    },
    {
        keywords: 'graphic-design',
        category: 'portfolio.category.lynnrogers',
    },
    {
        keywords: 'branding-editorial',
        category: 'portfolio.category.katiethompson',
    },
    {
        keywords: 'UI-UX',
        category: 'portfolio.category.brittneyhall',
    },
    {
        keywords: 'illustration',
        category: 'portfolio.category.margaretbullock',
    },
    {
        keywords: 'digital-art',
        category: 'portfolio.category.amandahoward',
    },
    {
        keywords: 'character-design',
        category: 'portfolio.category.rachelsharp',
    },
    {
        keywords: 'product-package-design',
        category: 'portfolio.category.vanessacohen',
    },
    {
        keywords: 'photography',
        category: 'portfolio.category.johnmurray',
    },
    {
        keywords: 'typography',
        category: 'portfolio.category.timothysmith',
    },
    {
        keywords: 'crafts',
        category: 'portfolio.category.jessicaking',
    },
    {
        keywords: 'fine-art',
        category: 'portfolio.category.johnmedina',
    },
];

/**
 * @param category 分类
 * @param order 排序 [like, pick, published]
 * @param time 时间范围 ['one-day', 'week', 'month', 'three-month']
 * @param query 搜索词
 * @query limit 分页，默认20
 */
export default async (ctx) => {
    // 分类、排序、时间范围、搜索词
    const { category = 'all', order = 'pick', time = 'all', query = '' } = ctx.req.param();
    //  分页
    const { limit } = ctx.req.query();

    // 请求链接
    let searchUrl = `https://api.stunning.kr/api/v1/dantats/portfolio?state=Public&limit=${limit ? Number.parseInt(limit, 10) : 20}&search=${query}&orderBy=${order}`;
    // 分类
    const index = (Number(category) || 0) - 1;
    if (index >= 0 && categoryMap[index]) {
        searchUrl += `&category=${categoryMap[index].category}`;
    }
    // 时间范围
    if (time !== 'all' && ['one-day', 'week', 'month', 'three-month'].includes(time)) {
        let startTime = '';
        const endTime = dayjs().endOf('d').format('YYYY-MM-DDTHH:mm:ss.SSS');

        // 过去24小时-day 最近一周-week 最近一个月-month 最近三个月three-month
        switch (time) {
            case 'one-day':
                startTime = dayjs().subtract(1, 'd').format('YYYY-MM-DDTHH:mm:ss.SSS');
                break;

            case 'week':
                startTime = dayjs().subtract(7, 'd').startOf('d').format('YYYY-MM-DDTHH:mm:ss.SSS');
                break;

            case 'month':
                startTime = dayjs().subtract(30, 'd').startOf('d').format('YYYY-MM-DDTHH:mm:ss.SSS');
                break;

            case 'three-month':
                startTime = dayjs().subtract(90, 'd').startOf('d').format('YYYY-MM-DDTHH:mm:ss.SSS');
                break;
        }
        searchUrl += `&publishedAt=${startTime}Z&publishedAt=${endTime}Z`;
    }

    // 发送 HTTP GET 请求到 API 并解构返回的数据对象
    const { data } = await got(searchUrl, {
        headers: {
            Origin: 'https://notefolio.net',
        },
    });

    // 从 API 响应中提取相关数据
    const items =
        data?.resultData.map((item) => {
            const { id, title, user, createdAt, categories = [], contents = [] } = item;

            const description = contents.map((item) => art(path.join(__dirname, './templates/search.art'), { item })).join(' ');

            return {
                // 文章标题
                title,
                // 文章链接
                link: `https://notefolio.net/${user.url}/${id}`,
                // 文章正文
                description,
                // 文章发布日期
                pubDate: parseDate(createdAt),
                // 如果有的话，文章作者
                author: user.nick,
                // 如果有的话，文章分类
                category: categories.map((label) => label.replace('portfolio.category.', '')),
            };
        }) || [];

    ctx.set('data', {
        // 源标题
        title: `${category}/${order}/${time}/${query} search`,
        // 源链接
        // link: '',
        // 源文章
        item: items,
    });
};
