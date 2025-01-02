import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const url = 'http://en.shisu.edu.cn';
const urlBackup = 'https://en.shisu.edu.cn';

export const route: Route = {
    path: '/en/:section',
    categories: ['university'],
    example: '/shisu/en/news',
    parameters: { section: 'The name of resources' },
    radar: [
        {
            source: ['en.shisu.edu.cn/resources/:section/'],
            target: '/en/:section',
        },
    ],
    name: 'SISU TODAY | FEATURED STORIES',
    maintainers: ['Duuckjing'],
    handler,
    description: `- features: Read a series of in-depth stories about SISU faculty, students, alumni and beyond campus.
  - news: SISU TODAY English site.`,
};

async function process(baseUrl: string, section: any) {
    const r = await ofetch(`${baseUrl}/resources/${section}/`);
    const $ = load(r);
    const itemsoup = $('.tab-con:nth-child(1) ul li')
        .toArray()
        .map((i0) => {
            const i = $(i0);
            const img = i.find('img').attr('src');
            const link = `${baseUrl}${i.find('h3>a').attr('href')}`;
            return {
                title: i.find('h3>a').text().trim(),
                link,
                pubDate: parseDate(i.find('p.time').text()),
                itunes_item_image: `${baseUrl}${img}`,
            };
        });
    const items = await Promise.all(
        itemsoup.map((j) =>
            cache.tryGet(j.link, async () => {
                const r = await ofetch(j.link);
                const $ = load(r);
                j.description = $('.details-con')
                    .html()!
                    .replaceAll(/<o:p>[\S\s]*?<\/o:p>/g, '')
                    .replaceAll(/(<p[^>]*>&nbsp;<\/p>\s*)+/gm, '<p>&nbsp;</p>');
                return j;
            })
        )
    );
    return {
        title: String(section) === 'features' ? 'FEATURED STORIES' : 'SISU TODAY',
        link: `${url}/resources/${section}/`,
        item: items,
    };
}

async function handler(ctx) {
    const { section } = ctx.req.param();
    let res: any;
    try {
        await ofetch(url);
        res = process(url, section);
    } catch {
        await ofetch(urlBackup);
        res = process(urlBackup, section);
    }
    return res;
}
