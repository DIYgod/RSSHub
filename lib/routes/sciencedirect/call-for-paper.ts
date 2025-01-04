import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/call-for-paper/:subject',
    categories: ['journal'],
    example: '/sciencedirect/call-for-paper/education',
    parameters: {},
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

/**
 * This handler fetches the calls-for-papers page on ScienceDirect,
 * extracts the embedded JSON data from the <script> element with data-iso-key="_0",
 * and generates RSS items from it.
 */
async function handler(ctx) {
    // Example: subject=education
    const { subject = '' } = ctx.req.param(); // or ctx.req.param() in some frameworks
    // Construct the URL and the Header
    const apiUrl = `https://www.sciencedirect.com/browse/calls-for-papers?subject=${subject}`;
    const headers = {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,...',
        'accept-language': 'zh,zh-TW;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'upgrade-insecure-requests': '1',
    };
    // Fetch the page
    const response = await got(apiUrl, { headers });
    // Load into Cheerio
    const $ = load(response.body);

    // 1) Grab the JSON from the script tag with data-iso-key="_0".
    const scriptJSON = $('script[data-iso-key="_0"]').text();
    if (!scriptJSON) {
        throw new Error('Cannot find the script with data-iso-key="_0"');
    }

    // 2) Parse the JSON string
    let data;
    try {
        data = JSON.parse(JSON.parse(scriptJSON ));
    } catch (error) {
        throw new Error(`Failed to parse embedded script JSON: ${error.message}`);
    }

    // 3) Extract Calls for Papers array
    const cfpList = data?.callsForPapers?.list || [];
    if (!cfpList.length) {
        throw new Error('No Calls for Papers found');
    }

    // 4) Build a list of items to return in the feed
    const items = cfpList.map((cfp) => {
        // Construct a link to the CfP detail page
        const link = `https://www.sciencedirect.com/special-issue/${cfp.contentId}/${cfp.url}`;

        // Build a description from the CfP fields
        const descriptionParts = [];
        if (cfp.summary) {
            descriptionParts.push(`<p><strong>Summary:</strong> ${cfp.summary}</p>`);
        }
        if (cfp.submissionDeadline) {
            descriptionParts.push(`<p><strong>Submission Deadline:</strong> ${cfp.submissionDeadline}</p>`);
        }
        if (cfp.journal) {
            descriptionParts.push(`<p><strong>Journal:</strong> ${cfp.journal.displayName} (IF: ${cfp.journal.impactFactor}, CiteScore: ${cfp.journal.citeScore})</p>`);
        }

        return {
            title: cfp.title,
            author: cfp.journal ? `${cfp.journal.displayName} (IF: ${cfp.journal.impactFactor})` : '',
            link,
            description: descriptionParts.join(''),
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
