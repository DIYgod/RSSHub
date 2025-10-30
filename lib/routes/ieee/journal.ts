import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
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

        return mappedItem;
    });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(`https://ieeexplore.ieee.org${item.link}`);

                const $ = load(response);

                const target = $('script[type="text/javascript"]:contains("xplGlobal.document.metadata")');
                const code = target.text() || '';

                // 捕获等号右侧的 JSON（最小匹配直到紧随的分号）
                const m = code.match(/xplGlobal\.document\.metadata\s*=\s*(\{[\s\S]*?\})\s*;/);
                item.abstract = m ? ((JSON.parse(m[1]) as { abstract?: string }).abstract ?? ' ') : ' ';
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    item,
                });

                return item;
            })
        )
    );

    return {
        title: displayTitle,
        link: `${ieeeHost}/xpl/tocresult.jsp?isnumber=${issueNumber}`,
        item: items,
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
