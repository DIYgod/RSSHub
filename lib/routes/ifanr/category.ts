import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const PATH_LIST = {
    早报: 'ifanrnews',
    评测: 'review',
    糖纸众测: 'tangzhi-evaluation',
    产品: 'product',
};

export const route: Route = {
    path: '/category/:name',
    categories: ['new-media'],
    example: '/ifanr/category/早报',
    parameters: {
        name: {
            description: '分类名称',
            options: Object.keys(PATH_LIST).map((name) => ({ value: name, label: name })),
        },
    },
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
            source: ['www.ifanr.com/category/:name'],
        },
    ],
    name: '分类',
    maintainers: ['donghongfei'],
    handler,
    description: `支持分类：早报、评测、糖纸众测、产品`,
};

async function handler(ctx) {
    const name = ctx.req.param('name');
    const nameEncode = encodeURIComponent(decodeURIComponent(name));
    const apiUrl = `https://sso.ifanr.com/api/v5/wp/article/?post_category=${nameEncode}&limit=20&offset=0`;
    const resp = await got({
        method: 'get',
        url: apiUrl,
    });
    const items = await Promise.all(
        resp.data.objects.map((item) => {
            let description = '';

            const banner = item.post_cover_image;

            if (banner) {
                description = `<img src="${banner}" alt="Article Cover Image" style="display: block; margin: 0 auto;"><br>`;
            }
            description += item.post_content;

            return {
                title: item.post_title.trim(),
                description,
                link: item.post_url,
                pubDate: parseDate(item.published_at * 1000),
                author: item.created_by.name,
            };
        })
    );

    return {
        title: `#${name} - iFanr 爱范儿`,
        link: `https://www.ifanr.com/category/${PATH_LIST[name]}`,
        description: `${name} 更新推送`,
        item: items,
    };
}
