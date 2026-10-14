import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function parsePublicationDate(value?: string) {
    if (!value?.trim()) {
        return;
    }
    const date = parseDate(value, 'YYYY-MM-DD');
    return Number.isNaN(date.getTime()) ? undefined : timezone(date, 8);
}

const typeMap = {
    tzgg: { name: 'tzgg', url: 'https://xc.hfut.edu.cn/1955/list.htm', root: 'https://xc.hfut.edu.cn', title: '合肥工业大学宣城校区 - 通知公告' },
    gztz: { name: 'gztz', url: 'https://xc.hfut.edu.cn/gztz/list.htm', root: 'https://xc.hfut.edu.cn', title: '合肥工业大学宣城校区 - 院系动态 - 工作通知' },
};

const commLink = 'https://xc.hfut.edu.cn/';

const parseList = async (ctx, type) => {
    if (!Object.hasOwn(typeMap, type)) {
        throw new InvalidParameterError('Unknown notice type. Use one of the documented types for this campus.');
    }
    const link = typeMap[type].url;
    const title = typeMap[type].title;

    const response = await got(link);
    const $ = load(response.data);

    const resultList = await parseArticle($);

    return {
        title,
        link,
        resultList,
    };
};

async function parseArticle($) {
    const data = $('#wp_news_w6').find('li').toArray();

    const items = data.map((item) => {
        const $item = $(item);
        const oriLink = $item.find('a').attr('href');
        const linkRes = new URL(oriLink, commLink).href;
        const pubDate = parsePublicationDate($item.find('.news_meta').text());

        return {
            title: $item.find('a').attr('title'),
            pubDate,
            link: linkRes,
        };
    });

    const resultItems = await pMap(
        items,
        async (item: (typeof items)[number]) => ({
            ...item,
            ...(await cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                const description = $('.wp_articlecontent').html() ?? $('.v_news_content').html() ?? undefined;
                return { description };
            })),
        }),
        { concurrency: 3 }
    );

    return resultItems;
}

export default parseList;
