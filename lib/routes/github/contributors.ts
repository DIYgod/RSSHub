import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/contributors/:user/:repo/:order?/:anon?',
    categories: ['programming'],
    example: '/github/contributors/DIYgod/RSSHub',
    parameters: { user: 'User name', repo: 'Repo name', order: 'Sort order by commit numbers, desc and asc (descending by default)', anon: 'Show anonymous users. Defaults to no, use any values for yes.' },
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
            source: ['github.com/:user/:repo/graphs/contributors', 'github.com/:user/:repo'],
            target: '/contributors/:user/:repo',
        },
    ],
    name: 'Repo Contributors',
    maintainers: ['zoenglinghou'],
    handler,
};

async function handler(ctx) {
    const { user, repo, order, anon } = ctx.req.param();

    const host = `https://github.com/${user}/${repo}`;
    const url = `https://api.github.com/repos/${user}/${repo}/contributors?` + (anon ? 'anon=1' : '');

    // Use token if available
    const headers: Record<string, string> = config.github && config.github.access_token ? { Authorization: `token ${config.github.access_token}` } : {};

    // First page
    const response = await ofetch.raw(url, {
        headers,
    });
    let data = response._data;

    // Get total page number, the link header is absent if there is only one page
    const lastPageLink = response.headers
        .get('link')
        ?.split(',')
        .find((elem) => elem.includes('"last"'));

    if (lastPageLink) {
        const urlBase = lastPageLink.match(/<(.*)page=\d*/)?.[1];
        const pageCount = Number(lastPageLink.match(/page=(\d*)/)?.[1]);
        const pages = Array.from({ length: pageCount - 1 }, (_, index) => index + 2);

        // Get every page
        const tasks = pages.map(async (page) => {
            const pageData = await ofetch(`${urlBase}page=${page}`, {
                headers,
            });
            data = [...data, ...pageData];
        });
        await Promise.all(tasks);
    }

    // Sort by commits
    data.sort((a, b) => a.contributions - b.contributions);
    if (order !== 'asc') {
        data.reverse();
    }

    const items = data.map((item) =>
        item.type === 'Anonymous'
            ? {
                  title: `Contributor: ${item.name}`,
                  description: `<p>Anonymous contributor</p><p>Name: ${item.name}</p><p>E-mail: ${item.email}</p><p>Contributions: ${item.contributions}</p>`,
                  guid: `anon-${item.name}`,
              }
            : {
                  title: `Contributor: ${item.login}`,
                  description: `<img src="${item.avatar_url}"></img><p><a href="${item.html_url}">${item.login}</a></p><p>Contributions: ${item.contributions}</p>`,
                  link: item.html_url,
                  guid: item.id,
              }
    );

    return {
        title: `${user}/${repo} Contributors`,
        link: `${host}/graphs/contributors`,
        description: `New contributors for ${user}/${repo}`,
        item: items,
    };
}
