import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/fe/:category',
    categories: ['university'],
    example: '/bnu/fe/18',
    parameters: {},
    radar: [
        {
            source: ['fe.bnu.edu.cn/pc/cms1info/list/1/:category'],
        },
    ],
    name: '教育学部-培养动态',
    maintainers: ['etShaw-zh'],
    handler,
    description: `\`https://fe.bnu.edu.cn/pc/cms1info/list/1/18\` 则对应为 \`/bnu/fe/18`,
};

async function handler(ctx) {
    const { category } = ctx.req.param();
    const apiUrl = 'https://fe.bnu.edu.cn/pc/cmscommon/nlist';
    let response;
    try {
        // 发送 POST 请求
        response = await got.post(apiUrl, {
            headers: {
                Accept: 'application/json, text/javascript, */*; q=0.01',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                Origin: 'https://fe.bnu.edu.cn',
                Referer: 'https://fe.bnu.edu.cn/pc/cms1info/list/1/18',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: `columnid=${category}&page=1`, // POST 数据
        });
    } catch {
        throw new Error('Failed to fetch data from API');
    }
    const jsonData = JSON.parse(response.body);
    // 检查返回的 code
    if (jsonData.code !== 0 || !jsonData.data) {
        throw new Error('Invalid API response');
    }

    const list = jsonData.data.map((item) => ({
        title: item.title,
        link: `https://fe.bnu.edu.cn/html/1/news/${item.htmlpath}/n${item.newsid}.html`,
        pubDate: parseDate(item.happendate, 'YYYY-MM-DD'),
    }));

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                item.author = '北京师范大学教育学部';
                item.description = $('.news02_div').html() || '暂无详细内容';
                return item;
            })
        )
    );

    return {
        title: '北京师范大学教育学部-培养动态',
        link: 'https://fe.bnu.edu.cn/pc/cms1info/list/1/18',
        description: '北京师范大学教育学部-培养动态最新通知',
        item: out,
    };
}
