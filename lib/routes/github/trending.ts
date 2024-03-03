// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { config } from '@/config';
import got from '@/utils/got';
import { art } from '@/utils/render';
import { load } from 'cheerio';
import * as path from 'node:path';

export default async (ctx) => {
    if (!config.github || !config.github.access_token) {
        throw new Error('GitHub trending RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
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

    ctx.set('data', {
        title: $('title').text(),
        link: trendingUrl,
        item: repos.map((r) => ({
            title: r.nameWithOwner,
            author: r.owner,
            description: art(path.join(__dirname, 'templates/trending-description.art'), {
                cover: r.openGraphImageUrl,
                desc: r.description,
                forks: r.forkCount,
                lang: r.primaryLanguage?.name || 'Unknown',
                stars: r.stargazerCount,
            }),
            link: `https://github.com/${r.nameWithOwner}`,
        })),
    });
};
