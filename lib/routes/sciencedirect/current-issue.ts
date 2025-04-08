import { Route } from '@/types';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import sanitizeHtml from 'sanitize-html';
import { config } from '@/config';

export const route: Route = {
    path: '/journal/:id/current',
    categories: ['journal'],
    example: '/sciencedirect/journal/journal-of-financial-economics/current',
    parameters: { id: 'Journal id, can be found in URL' },
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
            source: ['sciencedirect.com/journal/:id', 'sciencedirect.com/'],
        },
    ],
    name: 'Current Issue',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const baseUrl = 'https://www.sciencedirect.com';
    const currentUrl = `${baseUrl}/journal/${id}`;

    const pageResponse = await ofetch(currentUrl, {
        headers: {
            'User-Agent': config.trueUA,
        },
    });
    const $page = load(pageResponse);
    const pageData = JSON.parse(JSON.parse($page('script[type="application/json"]').text()));

    const issueUrl = `${currentUrl}${pageData.latestIssues.issues[0].uriLookup}`;
    const issueResponse = await ofetch(issueUrl, {
        headers: {
            'User-Agent': config.trueUA,
        },
    });
    const $issue = load(issueResponse);

    const issueData = JSON.parse(JSON.parse($issue('script[type="application/json"]').text()));
    const titleMetadata = issueData.titleMetadata;
    const currentIssue = issueData.articles.ihp.data;

    const list = currentIssue.issueBody.issueSec.flatMap((section) =>
        section.includeItem.map((item) => ({
            title: item.title,
            link: `${baseUrl}${item.href}`,
            author: item.authors.map((author) => `${author.givenName} ${author.surname}`).join(', '),
            doi: item.doi,
            pubDate: parseDate(item.coverDateStart),
            pii: item.pii,
        }))
    );

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(`https://www.sciencedirect.com/journal/0304405X/abstract?pii=${item.pii}`, {
                    headers: {
                        'User-Agent': config.trueUA,
                    },
                });

                item.description = response.data[0].abstracts[0].html ?? '';

                return item;
            })
        )
    );

    return {
        title: `${titleMetadata.displayName} | ${currentIssue.volIssueSupplementText}, (${currentIssue.coverDateText}) | ScienceDirect.com by Elsevier`,
        description: sanitizeHtml(titleMetadata.aimsAndScopeV2, { allowedTags: [], allowedAttributes: {} }),
        image: titleMetadata.largeCoverUrl ?? titleMetadata.smallCoverUrl,
        link: issueUrl,
        item: items,
    };
}
