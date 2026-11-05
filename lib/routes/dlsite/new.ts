import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { getComicFeed } from './comipo';

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
    view: ViewType.Articles,
    example: '/dlsite/new/home',
    parameters: {
        type: {
            description: '类型',
            options: Object.values(infos).map((info) => ({ value: info.type, label: info.name })),
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
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

    if (info.type === 'comic') {
        return getComicFeed(ctx);
    }

    const link = info.url.slice(1);

    const response = await got(new URL(link, host), {
        method: 'GET',
    });
    const data = response.data;
    const $ = load(data);
    $('img').each((_, element) => {
        const image = $(element);
        const src = image.attr(':src')?.match(/^is_show\s*\?\s*'((?:https?:)?\/\/[^']+)'/)?.[1];
        if (src) {
            image.attr('src', new URL(src, host).href);
        }
    });

    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content');
    const list = $('.n_worklist_item');
    const dateText = $('.work_update')
        .text()
        .trim()
        .replaceAll(/（.*）/g, '');
    const pubDate = timezone(parseDate(dateText, 'YYYY年M月D日'), 9);
    const item = list.toArray().map((element) => {
        const title = $('.work_name > a', element).text();
        const link = $('.work_name > a', element).attr('href');
        $('a', element).each((_index, element) => {
            $(element).attr('target', '_blank');
        });
        const category = $('.search_tag a, .work_category a, .work_genre span[title]', element)
            .toArray()
            .map((tag) => $(tag).text());
        const author = $('.maker_name', element).text();
        const content = $(element);
        content.find('.work_name, .maker_name, .search_tag, .work_category, .work_genre').remove();
        const description = content.html();

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
        link: new URL(link, host).href,
        description,
        language: 'ja' as const,
        item,
    };
}
