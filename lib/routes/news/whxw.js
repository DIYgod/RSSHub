import got from '~/utils/got.js';
import cheerio from 'cheerio';
import {parseDate} from '~/utils/parse-date';
import timezone from '~/utils/timezone';

export default async (ctx) => {
    const rootUrl = 'http://www.news.cn';
    const currentUrl = `${rootUrl}/whxw.htm`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('h3 a')
        .slice(0, 35)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                let detailResponse;
                try {
                    detailResponse = await got(item.link);
                } catch {
                    item.status = 404;
                }
                if (item.status !== 404) {
                    const content = cheerio.load(detailResponse.data);
                    const date = content('.header-time.left').text();
                    const author =
                        content('.editor').text() ||
                        content('.p-jc')
                            .text()
                            .replace(/[\r\n]/g, '');
                    item.author = author.match(/责任编辑.(.*)/)[1].trim();
                    content('#articleEdit').remove();
                    item.description = content('#detail').html();
                    item.pubDate = timezone(parseDate(date, 'YYYYMM/DD HH:mm:ss'), +8);
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
