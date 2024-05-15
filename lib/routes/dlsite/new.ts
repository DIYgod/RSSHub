import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const host = 'https://www.dlsite.com';
const infos = {
    // 全年齢向け
    home: {
        type: 'home',
        name: '「DLsite 同人」',
        url: '/home/new',
    },
    comic: {
        type: 'comic',
        name: '「DLsite コミック」',
        url: '/comic/new',
    },
    soft: {
        type: 'soft',
        name: '「DLsite PCソフト」',
        url: '/soft/new',
    },
    // 成人向け( R18 )
    maniax: {
        type: 'maniax',
        name: '「DLsite 同人 - R18」',
        url: '/maniax/new',
    },
    books: {
        type: 'books',
        name: '「DLsite 成年コミック - R18」',
        url: '/books/new',
    },
    pro: {
        type: 'pro',
        name: '「DLsite 美少女ゲーム」',
        url: '/pro/new',
    },
    // 女性向け
    girls: {
        type: 'girls',
        name: '「DLsite 乙女」',
        url: '/girls/new',
    },
    bl: {
        type: 'bl',
        name: '「DLsite BL」',
        url: '/bl/new',
    },
};

export const route: Route = {
    path: '/new/:type',
    categories: ['anime'],
    example: '/dlsite/new/home',
    parameters: { type: 'Type, see table below' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Current Release',
    maintainers: ['cssxsh'],
    handler,
    description: `| Doujin | Comics | PC Games | Doujin (R18) | Adult Comics | H Games | Otome | BL |
  | ------ | ------ | -------- | ------------ | ------------ | ------- | ----- | -- |
  | home   | comic  | soft     | maniax       | books        | pro     | girls | bl |`,
};

async function handler(ctx) {
    const info = infos[ctx.req.param('type')];
    // 判断参数是否合理
    if (info === undefined) {
        throw new InvalidParameterError('不支持指定类型！');
    }

    const link = info.url.slice(1);

    const response = await got(link, {
        method: 'GET',
        prefixUrl: host,
    });
    const data = response.data;
    const $ = load(data);

    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content');
    const list = $('.n_worklist_item');
    const dateText = $('.work_update')
        .text()
        .trim()
        .replaceAll(/（.*）/g, '');
    const pubDate = parseDate(dateText, 'YYYY年M月D日');
    const item = list.toArray().map((element) => {
        const title = $('.work_name', element).text();
        const link = $('.work_name > a', element).attr('href');
        // 使链接
        $('a', element).each((_index, element) => {
            $(element).attr('target', '_blank');
        });
        const description = $(element).html();
        const arr = $('.search_tag', element);
        const category = $('a', arr)
            .toArray()
            .map((a) => $(a).text());
        const author = $('.maker_name', element).text();

        const signle = {
            title,
            link,
            description,
            category,
            author,
            pubDate,
        };
        return signle;
    });

    return {
        title,
        link,
        description,
        language: 'ja-jp',
        item,
    };
}
