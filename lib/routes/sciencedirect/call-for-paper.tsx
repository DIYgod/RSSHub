import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/call-for-paper/:subject',
    categories: ['journal'],
    example: '/sciencedirect/call-for-paper/education',
    parameters: {
        subject: '学科分类，例如“education”',
    },
    radar: [
        {
            source: ['sciencedirect.com'],
        },
    ],
    name: 'Call for Papers',
    maintainers: ['etShaw-zh'],
    handler,
    url: 'sciencedirect.com/browse/calls-for-papers',
    description: '`sciencedirect.com/browse/calls-for-papers?subject=education` -> `/sciencedirect/call-for-paper/education`',
};

async function handler(ctx) {
    const { subject = '' } = ctx.req.param();
    const apiUrl = `https://www.sciencedirect.com/browse/calls-for-papers?subject=${subject}`;
    const headers = {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', // need this to avoid 403, 503 error
    };
    const response = await got(apiUrl, { headers });
    const $ = load(response.body);

    const scriptJSON = $('script[data-iso-key="_0"]').text();
    if (!scriptJSON) {
        throw new Error('Cannot find the script with data-iso-key="_0"');
    }

    let data;
    try {
        data = JSON.parse(JSON.parse(scriptJSON));
    } catch (error: any) {
        throw new Error(`Failed to parse embedded script JSON: ${error.message}`);
    }

    const cfpList = data?.callsForPapers?.list || [];
    if (!cfpList.length) {
        throw new Error('No Calls for Papers found');
    }

    const items = cfpList.map((cfp) => {
        const link = `https://www.sciencedirect.com/special-issue/${cfp.contentId}/${cfp.url}`;
        const description = renderToString(
            <div>
                <p>
                    <strong>Summary:</strong> {cfp.summary}
                </p>
                <p>
                    <strong>Submission Deadline:</strong> {cfp.submissionDeadline}
                </p>
                <p>
                    <strong>Journal:</strong> {`${cfp.journal.displayName} (IF: ${cfp.journal.impactFactor}, CiteScore: ${cfp.journal.citeScore})`}
                </p>
            </div>
        );

        return {
            title: cfp.title,
            author: `${cfp.journal.displayName} (IF: ${cfp.journal.impactFactor})`,
            link,
            description,
            pubDate: cfp.submissionDeadline || '',
        };
    });

    return {
        title: `ScienceDirect Calls for Papers - ${subject}`,
        link: apiUrl,
        description: `Calls for Papers on ScienceDirect for subject: ${subject}`,
        item: items,
    };
}
