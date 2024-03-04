// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('id') ?? '279';

    const rootUrl = 'https://support.wdc.com';
    const currentUrl = `${rootUrl}/downloads.aspx?p=${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const version = $('#WD_lblVersionSelected').text();

    const items = [
        {
            title: version,
            link: `${currentUrl}#${version}`,
            enclosure_url: $('#WD_hlDownloadFWSelected').attr('href'),
            pubDate: parseDate($('#WD_lblReleaseDateSelected').text(), 'D/M/YYYY'),
            description: $('.toggleInner')
                .html()
                .replace(/style="color:White;"/, ''),
        },
    ];

    ctx.set('data', {
        title: `${$('#WD_lblSelectedName').text()} | WD Support`,
        link: currentUrl,
        item: items,
    });
};
