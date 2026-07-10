import type { Route } from '@/types';

import { api, host } from './util';

export const route: Route = {
    path: '/search/:keyword/:domain?',
    categories: ['multimedia'],
    example: '/bt0/search/复仇者',
    parameters: { keyword: '搜索关键词', domain: '镜像编号, 对应域名 web{domain}.mukaku.com, 常用 2/3/5, 默认为 2' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '关键词搜索',
    maintainers: ['JaggerH'],
    handler,
};

async function handler(ctx) {
    const domain = ctx.req.param('domain') ?? '2';
    const keyword = ctx.req.param('keyword');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 24;

    // The site's own search box calls getVideoList with the keyword in `sb`; results are matched
    // titles (not torrents). Each links to its detail page, where /bt0/mv/:number lists the seeds.
    const data = await api(domain, 'getVideoList', { sb: keyword, page: 1, limit });
    const list = Array.isArray(data) ? data : (data.data ?? []);

    const items = list.map((v) => ({
        title: `${v.title}${v.otitle ? ` ${v.otitle}` : ''}${v.years ? ` (${v.years})` : ''}`,
        link: `${host(domain)}/mv/${v.idcode}`,
        guid: `mukaku-mv-${v.idcode}`,
        description: `${v.image ? `<img src="${v.image}"><br>` : ''}${[v.production_area, v.class, v.language].filter(Boolean).join(' / ')}${v.doub_score && v.doub_score !== '0' ? `<br>豆瓣评分：${v.doub_score}` : ''}${v.abstract ? `<br>${v.abstract.trim()}` : ''}`,
        category: [v.class, v.production_area].filter(Boolean),
    }));

    return {
        title: `${keyword} - 不太灵影视搜索`,
        link: `${host(domain)}/search?sb=${encodeURIComponent(keyword)}`,
        item: items,
        allowEmpty: true,
    };
}
