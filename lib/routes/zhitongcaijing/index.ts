import { Route, ViewType } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

const ids = {
    recommend: {
        url: 'content/recommend',
        title: '推荐',
    },
    immediately: {
        url: 'immediately',
        title: '7×24直播',
    },
    hkstock: {
        url: 'content/hkstock',
        title: '港股',
    },
    meigu: {
        url: 'content/meigu',
        title: '美股',
    },
    agu: {
        url: 'content/agu',
        title: '沪深',
    },
    ct: {
        url: 'content/ct',
        title: '创投',
    },
    esg: {
        url: 'content/esg',
        title: 'ESG',
    },
    aqs: {
        url: 'content/aqs',
        title: '券商',
    },
    ajj: {
        url: 'content/ajj',
        title: '基金',
    },
    focus: {
        url: 'focus',
        title: '要闻',
    },
    announcement: {
        url: 'announcement',
        title: '公告',
    },
    research: {
        url: 'research',
        title: '研究',
    },
    shares: {
        url: 'shares',
        title: '新股',
    },
    bazaar: {
        url: 'bazaar',
        title: '市场',
    },
    company: {
        url: 'company',
        title: '公司',
    },
};

export const route: Route = {
    path: '/:id?/:category?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/zhitongcaijing',
    parameters: { id: '栏目 id，可在对应栏目页 URL 中找到，默认为 recommend，即推荐', category: '分类 id，可在对应栏目子分类页 URL 中找到，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '推荐',
    maintainers: ['nczitzk'],
    handler,
    description: `| id           | 栏目 |
| ------------ | ---- |
| recommend    | 推荐 |
| hkstock      | 港股 |
| meigu        | 美股 |
| agu          | 沪深 |
| ct           | 创投 |
| esg          | ESG  |
| aqs          | 券商 |
| ajj          | 基金 |
| focus        | 要闻 |
| announcement | 公告 |
| research     | 研究 |
| shares       | 新股 |
| bazaar       | 市场 |
| company      | 公司 |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 'recommend';
    const category = ctx.req.param('category') ?? '';

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;

    const rootUrl = 'https://www.zhitongcaijing.com';
    const currentUrl = `${rootUrl}/${ids[id].url}.html${category === '' ? '' : `?category_key=${category}`}`;
    const apiUrl = `${rootUrl}/${ids[id].url}.html?data_type=1&page=1${category === '' ? '' : `&category_key=${category}`}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data?.data?.slice(0, limit) ?? [];

    let items = list.map((item) => {
        const title = item.title ?? item.content ?? item.digest ?? '';
        const linkPath = item.url ?? item.link ?? '';
        const link = linkPath ? `${rootUrl}${linkPath}` : `${rootUrl}/immediately.html`;
        const description = item.digest ?? item.content ?? '';
        const author = item.author_info?.author_name ?? item.author ?? '智通财经';
        const timestamp = item.create_time ?? Number.parseInt(item.original_time ?? '') ?? item.time ?? item.publish_time ?? item.ctime;
        const pubDate = timestamp ? parseDate(Number(timestamp) * (String(timestamp).length === 10 ? 1000 : 1)) : undefined;
        const category = [...((typeof item.keywords === 'string' ? item.keywords.split(',') : (Array.isArray(item.keywords) ? item.keywords : [])) ?? []), item.category_name ?? item.type_tag].filter(Boolean);

        return {
            title,
            link,
            description,
            author,
            pubDate,
            category,
        };
    });

    if (id !== 'immediately') {
        items = await Promise.all(
            items.map((item) =>
                cache.tryGet(item.link, async () => {
                    try {
                        const detailResponse = await got({
                            method: 'get',
                            url: item.link,
                            headers: {
                                Referer: 'https://www.zhitongcaijing.com/',
                                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                            },
                        });

                        const content = load(detailResponse.data);

                        content('#subscribe-vip-box').remove();
                        content('#news-content').remove();

                        item.description = art(path.join(__dirname, 'templates/description.art'), {
                            digest: content('.digetst-box').html() || content('.telegram-origin-contentn').html(),
                            description: content('.news-body-content').html(),
                        });
                    } catch {
                        // 详情页暂不可达（如 503）时，退化为列表摘要，保证路由可用
                    }
                    return item;
                })
            )
        );
    }

    return {
        title: `智通财经 - ${ids[id].title}`,
        link: currentUrl,
        item: items,
    };
}
