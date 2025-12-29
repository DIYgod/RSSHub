import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/trending/:since/:language/:spoken_language?',
    categories: ['programming'],
    example: '/github/trending/daily/javascript/en',
    view: ViewType.Notifications,
    parameters: {
        since: {
            description: 'time range',
            options: [
                {
                    value: 'daily',
                    label: 'Today',
                },
                {
                    value: 'weekly',
                    label: 'This week',
                },
                {
                    value: 'monthly',
                    label: 'This month',
                },
            ],
        },
        language: {
            description: "the feed language, available in [Trending page](https://github.com/trending/javascript?since=monthly) 's URL, don't filter option is `any`",
            default: 'any',
        },
        spoken_language: {
            description: "natural language, available in [Trending page](https://github.com/trending/javascript?since=monthly) 's URL",
        },
    },
    features: {
        requireConfig: [
            {
                name: 'GITHUB_ACCESS_TOKEN',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['github.com/trending'],
            target: '/trending/:since',
        },
    ],
    name: 'Trending',
    maintainers: ['DIYgod', 'jameschensmith'],
    handler,
    url: 'github.com/trending',
};

async function handler(ctx) {
    if (!config.github || !config.github.access_token) {
        throw new ConfigNotFoundError('GitHub trending RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }
    const since = ctx.req.param('since');
    const language = ctx.req.param('language') === 'any' ? '' : ctx.req.param('language');
    const spoken_language = ctx.req.param('spoken_language') ?? '';

    const trendingUrl = `https://github.com/trending/${encodeURIComponent(language)}?since=${since}&spoken_language_code=${spoken_language}`;
    const { data: trendingPage } = await got({
        method: 'get',
        url: trendingUrl,
        headers: {
            Referer: trendingUrl,
        },
    });
    const $ = load(trendingPage);

    const articles = $('article');
    const trendingRepos = articles.toArray().map((item) => {
        const [owner, name] = $(item).find('h2').text().split('/');
        return {
            name: name.trim(),
            owner: owner.trim(),
        };
    });

    const { data: repoData } = await got({
        method: 'post',
        url: 'https://api.github.com/graphql',
        headers: {
            Authorization: `bearer ${config.github.access_token}`,
        },
        json: {
            query: `
            query {
            ${trendingRepos
                .map(
                    (repo, index) => `
                _${index}: repository(owner: "${repo.owner}", name: "${repo.name}") {
                    ...RepositoryFragment
                }
            `
                )
                .join('\n')}
            }

            fragment RepositoryFragment on Repository {
                description
                forkCount
                nameWithOwner
                openGraphImageUrl
                primaryLanguage {
                    name
                }
                stargazerCount
            }
            `,
        },
    });

    const repos = Object.values(repoData.data).map((repo) => {
        const found = trendingRepos.find((r) => `${r.owner}/${r.name}` === repo.nameWithOwner);
        return { ...found, ...repo };
    });

    return {
        title: $('title').text(),
        link: trendingUrl,
        item: repos.map((r) => ({
            title: r.nameWithOwner,
            author: r.owner,
            description: renderToString(
                <>
                    <img src={r.openGraphImageUrl} />
                    <br />
                    {r.description ? raw(r.description) : null}
                    <br />
                    <br />
                    Language: {raw(r.primaryLanguage?.name || 'Unknown')}
                    <br />
                    Stars: {raw(String(r.stargazerCount))}
                    <br />
                    Forks: {raw(String(r.forkCount))}
                </>
            ),
            link: `https://github.com/${r.nameWithOwner}`,
        })),
    };
}
