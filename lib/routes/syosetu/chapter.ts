import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { CookieJar } from 'tough-cookie';

const cookieJar = new CookieJar();
cookieJar.setCookieSync('over18=yes', 'https://novel18.syosetu.com/');

export const route: Route = {
    path: '/chapter/:id',
    categories: ['reading'],
    example: '/syosetu/chapter/n1976ey',
    parameters: { id: 'Novel id, can be found in URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['novel18.syosetu.com/:id'],
        },
    ],
    name: 'chapter',
    maintainers: ['huangliangshusheng'],
    handler,
    description: `Eg: \`https://ncode.syosetu.com/n1976ey/\``,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = Number.parseInt(ctx.req.query('limit')) || 5;
    const link = `https://ncode.syosetu.com/${id}`;
    const $ = load(await get(link));

    const title = $('p.novel_title').text();
    const description = $('#novel_ex').html();

    const chapter_list = $('dl.novel_sublist2')
        .map((_, chapter) => {
            const $_chapter = $(chapter);
            const chapter_link = $_chapter.find('a');
            return {
                title: chapter_link.text(),
                link: chapter_link.attr('href'),
                pubDate: timezone(parseDate($_chapter.find('dt').text(), 'YYYY/MM/DD HH:mm'), +9),
            };
        })
        .toArray()
        .sort((a, b) => (a.pubDate <= b.pubDate ? 1 : -1))
        .slice(0, limit);

    const item_list = await Promise.all(
        chapter_list.map((chapter) =>
            cache.tryGet(chapter.link, async () => {
                chapter.link = `https://ncode.syosetu.com${chapter.link}`;
                const content = load(await get(chapter.link));
                chapter.description = content('#novel_honbun').html();
                return chapter;
            })
        )
    );

    return {
        title,
        description,
        link,
        language: 'ja',
        item: item_list,
    };
}

const get = async (url) => {
    const response = await got({
        method: 'get',
        url,
        cookieJar,
    });

    return response.data;
};
