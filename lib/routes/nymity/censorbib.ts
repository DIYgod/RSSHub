import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';

const url = 'https://censorbib.nymity.ch/';

export const route: Route = {
    path: '/censorbib',
    categories: ['journal'],
    example: '/nymity/censorbib',
    radar: [
        {
            source: ['censorbib.nymity.ch/'],
        },
    ],
    name: 'CensorBib Updates',
    maintainers: ['xtexChooser'],
    handler,
    url: 'censorbib.nymity.ch/',
};

async function handler() {
    const resp = await got.get(url);

    const $ = load(resp.data);
    const items = $('#container ul li')
        .toArray()
        .map((item): DataItem => {
            const c = $(item);
            const id = c.attr('id')!;
            const title = c.find('span.paper').text();
            const author = c.find('span.author').text();
            const other = c.find('span.other').text();
            const download = c.find("img.icon[title='Download paper']").parent().attr('href');
            const downloadBibTex = c.find('a.bibtex-link').attr('href');
            const linkToPaper = c.find("img.icon[title='Link to paper']").parent().attr('href');
            return {
                title,
                description: [
                    other,
                    download ? $('<a>').attr('href', new URL(download, url).href).text('Download').toString() : undefined,
                    downloadBibTex ? $('<a>').attr('href', new URL(downloadBibTex, url).href).text('BibTeX').toString() : undefined,
                ]
                    .filter(Boolean)
                    .join('<br/><br/>'),
                author,
                guid: id,
                link: linkToPaper ? new URL(linkToPaper, url).href : `${url}#${encodeURIComponent(id)}`,
            };
        });

    return {
        title: 'CensorBib',
        link: url,
        description: 'CensorBib Updates',
        item: items,
    };
}
