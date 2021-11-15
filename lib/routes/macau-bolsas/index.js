import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        lang
    } = ctx.params;
    const url = `https://www.bolsas.gov.mo/${lang === 'pt' ? lang : ''}`;
    const response = await got({
        method: 'get',
        url,
    });
    const $Wrapper = cheerio.load(response.data);
    const liItems = $Wrapper('ul.news-list li');
    const items = await Promise.all(
        liItems &&
            liItems
                .map(async (_, item) => {
                    const $item = $Wrapper(item);
                    const $newsItem = $item.find('.news-item');
                    const bureau = $newsItem.find('.label').text();
                    const title = $newsItem.find('.title').text();
                    const link = $newsItem.find('.title').attr('href');
                    const pubDate = new Date($item.find('.date').text() + 'T00:00:00+0800');
                    const description = await ctx.cache.tryGet(link, async () => {
                        const response = await got({
                            method: 'get',
                            url: link,
                        });
                        const $ = cheerio.load(response.data);
                        return $('.news-content').html();
                    });
                    return {
                        title: `[${bureau}] ${title}`,
                        link,
                        description,
                        pubDate,
                    };
                })
                .get()
    );

    ctx.state.data = {
        title: '澳門特別行政區政府各公共部門獎助貸學金服務平台',
        link: url,
        description: '澳門特別行政區政府各公共部門獎助貸學金服務平台',
        item: items,
    };
};
