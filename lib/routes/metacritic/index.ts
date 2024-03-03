// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

const { sorts, types } = require('./util');

export default async (ctx) => {
    const { type = 'game', sort = 'new', filter } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const rootUrl = 'https://www.metacritic.com';
    const rootApiUrl = 'https://internal-prod.apigee.fandom.net';
    const apiUrl = new URL('v1/xapi/finder/metacritic/web', rootApiUrl).href;

    const currentUrlObject = new URL(`/browse/${type}/all/all/all-time/${sort}/${filter ? `?${filter}` : ''}`, rootUrl);
    const currentUrlParams = currentUrlObject.searchParams;
    const currentUrl = currentUrlObject.href;

    const { data: currentResponse } = await got(currentUrl);

    const apiKey = currentResponse.match(/apiKey=(.*?)&/)[1];

    const searchParams = {
        sortBy: `-${sorts[sort].id}`,
        productType: types[type].id,
        limit,
        apiKey,
    };

    const genres = currentUrlParams.getAll('genre').join(',').toLowerCase();
    const releaseTypes = currentUrlParams.getAll('releaseType').join(',');

    if (genres) {
        searchParams.genres = genres;
    }

    if (releaseTypes) {
        searchParams.releaseType = releaseTypes;
    }

    const platforms = currentUrlParams.getAll('platform');
    const networks = currentUrlParams.getAll('network');

    if (platforms.length || networks.length) {
        const labels = {};
        const labelPattern = '{label:"([^"]+)",value:(\\d+),href:a,meta:{mcDisplayWeight';

        for (const m of currentResponse.match(new RegExp(labelPattern, 'g'))) {
            const matches = m.match(new RegExp(labelPattern));

            labels[
                matches[1]
                    .toLowerCase()
                    .split(/(\s\(|\\u002f(?!\s))/)[0]
                    .replaceAll('-', '---')
                    .replaceAll(/\s\/\s/g, '-or-')
                    .replaceAll('+', '-plus')
                    .replaceAll(/\s/g, '-')
            ] = matches[2];
        }

        if (platforms.length) {
            searchParams.gamePlatformIds = platforms
                .map((p) => (Object.hasOwn(labels, p) ? labels[p] : undefined))
                .filter(Boolean)
                .join(',');
        }

        if (networks.length) {
            searchParams.streamingNetworkIds = networks
                .map((p) => (Object.hasOwn(labels, p) ? labels[p] : undefined))
                .filter(Boolean)
                .join(',');
        }
    }

    const { data: response } = await got(apiUrl, {
        searchParams,
    });

    const items = response.data.items.slice(0, limit).map((item) => ({
        title: item.title,
        link: new URL(`${type}/${item.slug}`, rootUrl).href,
        description: art(path.join(__dirname, 'templates/description.art'), {
            image: item.image
                ? {
                      src: new URL(`a/img/catalog${item.image.bucketPath}`, rootUrl).href,
                      alt: item.image.alt,
                  }
                : undefined,
            description: item.description,
            score: item.criticScoreSummary?.score ?? undefined,
        }),
        category: item.genres.map((c) => c.name),
        guid: `metacritic-${item.id}`,
        pubDate: parseDate(item.releaseDate),
        upvotes: item.criticScoreSummary?.positiveCount ? Number.parseInt(item.criticScoreSummary?.positiveCount, 10) : 0,
        downvotes: item.criticScoreSummary?.negativeCount ? Number.parseInt(item.criticScoreSummary?.negativeCount, 10) : 0,
        comments: item.criticScoreSummary?.reviewCount ? Number.parseInt(item.criticScoreSummary?.reviewCount, 10) : 0,
    }));

    const $ = load(currentResponse);

    const icon = new URL($('meta[data-hid="msapplication-task-metacritic"]').prop('content').split('icon-uri=').pop(), rootUrl).href;

    ctx.set('data', {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang'),
        image: $('link[rel="icon"]').prop('content'),
        icon,
        logo: icon,
        subtitle: $('meta[name="msapplication-tooltip"]').prop('content'),
        author: $('meta[name="twitter:site"]').prop('content'),
        allowEmpty: true,
    });
};
