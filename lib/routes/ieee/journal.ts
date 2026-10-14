import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';
import { fetchArticleMetadata } from './utils';

const ieeeHost = 'https://ieeexplore.ieee.org';

export const route: Route = {
    name: 'Journal Articles',
    maintainers: ['HenryQW'],
    categories: ['journal'],
    path: '/journal/:punumber/:earlyAccess?',
    parameters: {
        punumber: 'Publication Number, look for `punumber` in the URL',
        earlyAccess: 'Optional, set any value to get early access articles',
    },
    example: '/ieee/journal/6287639/preprint',
    handler,
};

async function handler(ctx) {
    const publicationNumber = ctx.req.param('punumber');
    if (!/^[1-9]\d*$/.test(publicationNumber)) {
        throw new InvalidParameterError('Invalid publication number. Use a positive integer.');
    }
    const earlyAccess = !!ctx.req.param('earlyAccess');

    const { displayTitle, currentIssue, preprintIssue, coverImagePath, coverImage } = await fetchMetadata(publicationNumber);
    const { issueNumber, volume } = earlyAccess ? preprintIssue : currentIssue;

    const tocData = await fetchTOCData(publicationNumber, issueNumber);
    const list: Array<ReturnType<ReturnType<typeof mapRecordToItem>>> = tocData.records.map((item) => {
        const mappedItem = mapRecordToItem(volume)(item);

        return mappedItem;
    });

    const items = await pMap(
        list,
        async (item) => {
            const metadata = await fetchArticleMetadata(item.link);
            const article = { ...item, abstract: metadata.abstract || item.abstract, pubDate: metadata.insertDate ? parseDate(metadata.insertDate) : undefined };
            return { ...article, description: renderDescription(article) };
        },
        { concurrency: 3 }
    );

    return {
        title: displayTitle,
        link: `${ieeeHost}/xpl/tocresult.jsp?isnumber=${issueNumber}`,
        item: items,
        image: coverImagePath || coverImage ? new URL(coverImagePath || coverImage, ieeeHost).href : undefined,
    };
}

async function fetchMetadata(punumber) {
    const response = await got(`${ieeeHost}/rest/publication/home/metadata?pubid=${punumber}`);
    return response.data;
}

async function fetchTOCData(punumber, isnumber) {
    const response = await got.post(`${ieeeHost}/rest/search/pub/${punumber}/issue/${isnumber}/toc`, {
        json: { punumber, isnumber, rowsPerPage: '100' },
    });
    return response.data;
}

function mapRecordToItem(volume) {
    return (item) => ({
        abstract: load(item.abstract ?? '').text(),
        author: item.authors?.map((author) => author.preferredName).join('; '),
        description: '',
        doi: item.doi,
        link: item.htmlLink,
        title: item.articleTitle || '',
        volume,
    });
}
