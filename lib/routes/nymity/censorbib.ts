import { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
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
            const title = c.find('span.paper').text().trim();
            const author = c.find('span.author').text().trim();
            const other = c.find('span.other').text().trim();
            const download = c.find("img.icon[title='Download paper']").parent().attr('href');
            const downloadBibTex = c.find("img.icon[title='Download BibTeX']").parent().attr('href');
            const linkToPaper = c.find("img.icon[title='Link to paper']").parent().attr('href');
            return {
                title,
                description: `${other}<br/><br/><a href='${download}'>Download</a><br/><a href='${downloadBibTex}'>Download BibTex</a>`,
                author,
                guid: id,
                link: linkToPaper,
            };
        });

    return {
        title: 'CensorBib',
        link: url,
        description: 'CensorBib Updates',
        item: items,
    };
}
