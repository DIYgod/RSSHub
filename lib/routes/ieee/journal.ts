import { Route } from '@/types';

import got from '@/utils/got';
import path from 'node:path';
import { art } from '@/utils/render';

const ieeeHost = 'https://ieeexplore.ieee.org';

export const route: Route = {
    name: 'IEEE Journal Articles',
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
    const earlyAccess = !!ctx.req.param('earlyAccess');

    const metadata = await fetchMetadata(publicationNumber);
    const { displayTitle, currentIssue, preprintIssue, coverImagePath } = metadata;
    const { issueNumber, volume } = earlyAccess ? preprintIssue : currentIssue;

    const tocData = await fetchTOCData(publicationNumber, issueNumber);
    const list = tocData.records.map((item) => {
        const mappedItem = mapRecordToItem(volume)(item);

        mappedItem.description = art(path.join(__dirname, 'templates/description.art'), {
            item: mappedItem,
        });

        return mappedItem;
    });

    return {
        title: displayTitle,
        link: `${ieeeHost}/xpl/tocresult.jsp?isnumber=${issueNumber}`,
        item: list,
        image: `${ieeeHost}${coverImagePath}`,
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
        abstract: item.abstract || '',
        authors: item.authors ? item.authors.map((author) => author.preferredName).join('; ') : '',
        description: '',
        doi: item.doi,
        link: item.htmlLink,
        title: item.articleTitle || '',
        volume,
    });
}
