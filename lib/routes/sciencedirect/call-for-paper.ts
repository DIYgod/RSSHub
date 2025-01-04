import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';
const __dirname = getCurrentPath(import.meta.url);

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
    const response = await got(apiUrl);
    const $ = load(response.body);

    // 1) Grab the JSON from the script tag with data-iso-key="_0".
    const scriptJSON = $('script[data-iso-key="_0"]').text();
    if (!scriptJSON) {
        throw new Error('Cannot find the script with data-iso-key="_0"');
    }

    // 2) Parse the JSON string
    let data;
    try {
        data = JSON.parse(JSON.parse(scriptJSON));
    } catch (error: any) {
        throw new Error(`Failed to parse embedded script JSON: ${error.message}`);
    }

    // 3) Extract Calls for Papers array
    const cfpList = data?.callsForPapers?.list || [];
    if (!cfpList.length) {
        throw new Error('No Calls for Papers found');
    }

    // 4) Build a list of items to return in the feed
    const items = cfpList.map((cfp) => {
        const link = `https://www.sciencedirect.com/special-issue/${cfp.contentId}/${cfp.url}`;
        const description = art(path.join(__dirname, 'templates/description.art'), {
            summary: cfp.summary,
            submissionDeadline: cfp.submissionDeadline,
            displayName: cfp.journal.displayName,
            impactFactor: cfp.journal.impactFactor,
            citeScore: cfp.journal.citeScore,
        });

        return {
            title: cfp.title,
            author: cfp.journal ? `${cfp.journal.displayName} (IF: ${cfp.journal.impactFactor})` : '',
            link,
            description,
            pubDate: cfp.submissionDeadline || '',
        };
    });

    // 5) Return your feed data in whatever format your code expects
    return {
        title: `ScienceDirect Calls for Papers - ${subject}`,
        link: apiUrl,
        description: `Calls for Papers on ScienceDirect for subject: ${subject}`,
        item: items,
    };
}
