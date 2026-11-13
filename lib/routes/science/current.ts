import type { Language, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

import { baseUrl } from './utils';

export const route: Route = {
    path: '/current/:journal?',
    categories: ['journal'],
    example: '/science/current/science',
    parameters: { journal: 'Short name for a journal' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: true,
    },
    radar: [
        {
            source: ['science.org/journal/:journal', 'science.org/toc/:journal/current'],
            target: '/current/:journal',
        },
    ],
    name: 'Current Issue',
    maintainers: ['y9c', 'TonyRL'],
    handler,
    description: `|  Short name |    Full name of the journal    | Route                                                                          |
| :---------: | :----------------------------: | ------------------------------------------------------------------------------ |
|   science   |             Science            | [/science/current/science](https://rsshub.app/science/current/science)         |
|    sciadv   |        Science Advances        | [/science/current/sciadv](https://rsshub.app/science/current/sciadv)           |
|  sciimmunol |       Science Immunology       | [/science/current/sciimmunol](https://rsshub.app/science/current/sciimmunol)   |
| scirobotics |        Science Robotics        | [/science/current/scirobotics](https://rsshub.app/science/current/scirobotics) |
|  signaling  |        Science Signaling       | [/science/current/signaling](https://rsshub.app/science/current/signaling)     |
|     stm     | Science Translational Medicine | [/science/current/stm](https://rsshub.app/science/current/stm)                 |

- Using route (\`/science/current/\` + "short name for a journal") to get current issue of a journal from AAAS.
- Leaving it empty (\`/science/current\`) to get update from Science.`,
};

async function handler(ctx) {
    const { journal = 'science' } = ctx.req.param();
    const feedUrl = `https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=${journal}`;
    const feed = await parser.parseURL(feedUrl);

    return {
        title: feed.title ?? `${journal} | Current Issue`,
        description: feed.description,
        image: `${baseUrl}/apple-touch-icon.png`,
        link: feed.link ?? `${baseUrl}/toc/${journal}/current`,
        language: 'en-us' as const satisfies Language,
        item: feed.items
            .map((item) => {
                const date = item.isoDate ?? item.pubDate;
                return {
                    title: item.title ?? '',
                    link: item.link,
                    guid: item.guid ?? item.id,
                    description: item.content ?? item.contentSnippet,
                    pubDate: date ? parseDate(date) : undefined,
                    author: item.creator ?? item.author,
                    category: item.categories,
                };
            })
            .filter((item) => item.title),
    };
}
