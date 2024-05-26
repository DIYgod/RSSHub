import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import path from 'node:path';
import { art } from '@/utils/render';

import { CookieJar } from 'tough-cookie';
const cookieJar = new CookieJar();
const ieeeHost = 'https://ieeexplore.ieee.org';

export const route: Route = {
    name: 'IEEE Journal Articles',
    maintainers: ['HenryQW'],
    categories: ['journal'],
    path: '/journal/:punumber/:preprint?',
    parameters: { punumber: 'Publication Number, look for `punumber` in the URL', preprint: 'Optional, set any value to get early access preprints' },
    example: '/ieee/journal/6287639/preprint',
    handler,
};

async function handler(ctx) {
    const publicationNumber = ctx.req.param('punumber');
    const preprint = !!ctx.req.param('preprint');

    const metadata = await fetchMetadata(publicationNumber);
    const { displayTitle, currentIssue, preprintIssue } = metadata;
    const { issueNumber, volume } = preprint ? preprintIssue : currentIssue;

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
    };
}

async function fetchMetadata(punumber) {
    const response = await got(`${ieeeHost}/rest/publication/home/metadata?pubid=${punumber}`, {
        cookieJar,
    });
    return response.data;
}

async function fetchTOCData(punumber, isnumber) {
    const response = await got.post(`${ieeeHost}/rest/search/pub/${punumber}/issue/${isnumber}/toc`, {
        cookieJar,
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
