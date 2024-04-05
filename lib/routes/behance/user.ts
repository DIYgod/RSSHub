import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:user/:type?',
    categories: ['design'],
    example: '/behance/mishapetrick',
    parameters: { user: 'username', type: 'type, `projects` or `appreciated`, `projects` by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'User Works',
    maintainers: ['MisteryMonster'],
    handler,
    description: `Behance user's profile URL, like [https://www.behance.net/mishapetrick](https://www.behance.net/mishapetrick) the username will be \`mishapetrick\`。`,
};

async function handler(ctx) {
    const user = ctx.req.param('user') ?? '';
    const type = ctx.req.param('type') ?? 'projects';

    const response = await got({
        method: 'get',
        url: `https://www.behance.net/${user}/${type}`, // 接口只获取12个项目
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    });
    const data = response.data;
    let list;
    if (type === 'projects') {
        list = data.profile.activeSection.work.projects.slice(0, 12);
    }
    if (type === 'appreciated') {
        list = data.profile.activeSection.appreciations.appreciations.slice(0, 12);
    }
    const articledata = await Promise.all(
        list.map(async (item) => {
            if (type === 'appreciated') {
                item = item.project;
            }
            const url = `${item.url}?ilo0=1`;
            const description = await cache.tryGet(url, async () => {
                const response2 = await got({
                    method: 'get',
                    url,
                });
                const articleHtml = response2.data;
                const $2 = load(articleHtml);
                $2('.ImageElement-root-kir').remove();
                $2('.embed-dimensions').remove();
                $2('script.js-lightbox-slide-content').each((_, elem) => {
                    elem = $2(elem);
                    elem.replaceWith(elem.html());
                });
                const content = $2('div.project-styles').html();
                const single = {
                    content,
                };
                return single;
            });
            return description;
        })
    );
    return {
        title: `${data.profile.owner.first_name} ${data.profile.owner.last_name}'s ${type}`,
        link: data.profile.owner.url,
        item: list.map((item, index) => {
            if (type === 'appreciated') {
                item = item.project;
            }
            return {
                title: item.name,
                description: articledata[index].content,
                link: item.url,
                pubDate: parseDate(item.published_on * 1000),
            };
        }),
    };
}
