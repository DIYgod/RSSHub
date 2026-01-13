import dayjs from 'dayjs';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { ViewType } from '@/types';
// 导入所需模组
import got from '@/utils/got'; // 自订的 got
import { parseDate } from '@/utils/parse-date';

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

const renderContentItem = (item) =>
    renderToString(
        <>
            {item.type === 'Image' ? (
                item.files?.map((file) => (
                    <>
                        <img src={file.url} alt="" style="max-width: 100%; height: auto;" />
                        <br />
                    </>
                ))
            ) : item.type === 'Text' ? (
                <>
                    {raw(item.content ?? '')}
                    <br />
                </>
            ) : null}
        </>
    );

/**
 * @param category 分类
 * @param order 排序 [like, pick, published]
 * @param time 时间范围 ['one-day', 'week', 'month', 'three-month']
 * @param query 搜索词
 * @query limit 分页，默认20
 */
export const route: Route = {
    path: '/search/:category?/:order?/:time?/:query?',
    categories: ['design'],
    view: ViewType.Pictures,
    example: '/notefolio/search/1/pick/all/life',
    parameters: {
        category: {
            description: 'Category, see below',
            options: [
                { value: 'all', label: 'All (전체)' },
                { value: '1', label: 'Video / Motion Graphics (영상/모션그래픽)' },
                { value: '2', label: 'Graphic Design (그래픽 디자인)' },
                { value: '3', label: 'Branding / Editing (브랜딩/편집)' },
                { value: '4', label: 'UI/UX (UI/UX)' },
                { value: '5', label: 'Illustration (일러스트레이션)' },
                { value: '6', label: 'Digital Art (디지털 아트)' },
                { value: '7', label: 'Character Design (캐릭터 디자인)' },
                { value: '8', label: 'Product Package Design (제품/패키지 디자인)' },
                { value: '9', label: 'Photography (포토그래피)' },
                { value: '10', label: 'Typography (타이포그래피)' },
                { value: '11', label: 'Crafts (공예)' },
                { value: '12', label: 'Fine Art (파인아트)' },
            ],
            default: 'all',
        },
        order: {
            description: 'Order, `pick` as Notefolio Pick, `published` as Newest, `like` as like, `pick` by default',
            options: [
                { value: 'pick', label: 'Notefolio Pick' },
                { value: 'published', label: 'Newest' },
                { value: 'like', label: 'Like' },
            ],
            default: 'pick',
        },
        time: {
            description: 'Time',
            options: [
                { value: 'all', label: 'All the time' },
                { value: 'one-day', label: 'Latest 24 hours' },
                { value: 'week', label: 'Latest week' },
                { value: 'month', label: 'Latest month' },
                { value: 'three-month', label: 'Latest 3 months' },
            ],
            default: 'all',
        },
        query: 'Keyword, empty by default',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['notefolio.net/search'],
        },
    ],
    name: 'Works',
    maintainers: ['BianTan'],
    handler,
    url: 'notefolio.net/search',
    description: `| Category | Name in Korean     | Name in English         |
| -------- | ------------------ | ----------------------- |
| all      | 전체               | All                     |
| 1        | 영상/모션그래픽    | Video / Motion Graphics |
| 2        | 그래픽 디자인      | Graphic Design          |
| 3        | 브랜딩/편집        | Branding / Editing      |
| 4        | UI/UX              | UI/UX                   |
| 5        | 일러스트레이션     | Illustration            |
| 6        | 디지털 아트        | Digital Art             |
| 7        | 캐릭터 디자인      | Character Design        |
| 8        | 제품/패키지 디자인 | Product Package Design  |
| 9        | 포토그래피         | Photography             |
| 10       | 타이포그래피       | Typography              |
| 11       | 공예               | Crafts                  |
| 12       | 파인아트           | Fine Art                |`,
};

async function handler(ctx) {
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

            default:
                throw new Error(`Unknown time: ${time}`);
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

            const description = contents.map((item) => renderContentItem(item)).join(' ');

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

    return {
        // 源标题
        title: `${category}/${order}/${time}/${query} search`,
        // 源链接
        // link: '',
        // 源文章
        item: items,
    };
}
