import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.ss.pku.edu.cn';

const getSingleRecord = async (url) => {
    const res = await got(url);

    const $ = load(res.data);
    const list = $('#info-list-ul').find('li');

    return list.toArray().map((item) => {
        item = $(item);
        const date = item.find('.time').text();
        return {
            title: item.find('a').attr('title'),
            pubDate: parseDate(date),
            link: baseUrl + item.find('a').attr('href'),
        };
    });
};

const getArticle = (item, tryGet) =>
    tryGet(item.link, async () => {
        const response = await got(item.link);
        const $ = load(response.data);

        item.description = $('.article-content').html();
        return item;
    });

export { baseUrl, getSingleRecord, getArticle };
