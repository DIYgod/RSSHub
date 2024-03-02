import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const link = 'https://computer.hdu.edu.cn';
const host = 'https://computer.hdu.edu.cn/6769/list.htm';

const getSingleRecord = async () => {
    const res = await got(host);

    const $ = load(res.data);
    const list = $('.posts-list').find('li');

    return (
        list &&
        list
            .map((index, item) => {
                item = $(item);
                const dateTxt = item.find('.date').text();
                const date = dateTxt.slice(1, -1);
                return {
                    title: item.find('a').text(),
                    pubDate: parseDate(date),
                    link: link + item.find('a').attr('href'),
                };
            })
            .get()
    );
};

export default async (ctx) => {
    const items = await getSingleRecord();
    const out = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                return {
                    title: item.title,
                    link: item.link,
                    description: $('.wp_articlecontent').html(),
                    pubDate: item.pubDate,
                };
            })
        )
    );

    ctx.set('data', {
        title: '杭电计算机-研究生通知',
        description: '杭州电子科技大学计算机学院-研究生教学通知',
        link: host,
        item: out,
    });
};
