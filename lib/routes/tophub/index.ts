// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { config } from '@/config';

export default async (ctx) => {
    const id = ctx.req.param('id');

    const link = `https://tophub.today/n/${id}`;
    const response = await got.get(link, {
        headers: {
            Referer: 'https://tophub.today',
            Cookie: config.tophub.cookie,
        },
    });
    const $ = load(response.data);

    const title = $('div.Xc-ec-L.b-L').text().trim();

    const out = $('div.Zd-p-Sc > div:nth-child(1) tr')
        .toArray()
        .map((e) => {
            const info = {
                title: $(e).find('td.al a').text(),
                link: $(e).find('td.al a').attr('href'),
            };
            return info;
        });

    ctx.set('data', {
        title,
        link,
        item: out,
    });
};
