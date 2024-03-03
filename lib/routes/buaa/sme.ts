// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const BASE_URL = 'http://www.sme.buaa.edu.cn';

export default async (ctx) => {
    const { path = 'tzgg' } = ctx.req.param();
    const url = `${BASE_URL}/${path}.htm`;
    const { title, list } = await getList(url);
    ctx.set('data', {
        // 源标题
        title,
        // 源链接
        link: url,
        // 源文章
        item: await getItems(list),
    });
};

async function getList(url) {
    const { data } = await got(url);
    const $ = load(data);
    const title = $('.nytit .fr a')
        .toArray()
        .slice(1)
        .map((item) => $(item).text().trim())
        .join(' - ');
    const list = $("div[class='Newslist'] > ul > li")
        .toArray()
        .map((item) => {
            item = $(item);
            const $a = item.find('a');
            const link = $a.attr('href');
            return {
                title: item.find('a').text(),
                link: link.startsWith('http') ? link : `${BASE_URL}/${link}`, // 有些链接是相对路径
                pubDate: timezone(parseDate(item.find('span').text()), +8),
            };
        });
    return {
        title,
        list,
    };
}

function getItems(list) {
    return Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: descrptionResponse } = await got(item.link);
                const $descrption = load(descrptionResponse);
                item.description = $descrption('div[class="v_news_content"]').html();
                return item;
            })
        )
    );
}
