import got from '~/utils/got';
import cheerio from 'cheerio';
import {parseDate} from '~/utils/parse-date';
import timezone from '~/utils/timezone';

export default async (ctx) => {
    const {
        data
    } = await got({
        method: 'get',
        url: `https://trow.cc`,
    });

    const $ = cheerio.load(data);
    const list = $('#portal_content .borderwrap[style="display:show"]');

    ctx.state.data = {
        title: `The Ring of Wonder - Portal`,
        link: `https://trow.cc`,
        description: `The Ring of Wonder 首页更新`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const dateraw = item.find('.postdetails').text();
                    return {
                        title: item.find('.maintitle p:nth-child(2) > a').text(),
                        description: item.find('.portal_news_content .row18').html(),
                        link: item.find('.maintitle p:nth-child(2) > a').attr('href'),
                        author: item.find('.postdetails a').text(),
                        pubDate: timezone(parseDate(dateraw.slice(3), 'YYYY-MM-DD, HH:mm'), +8),
                    };
                })
                .get(),
    };
};
