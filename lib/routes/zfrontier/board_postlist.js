import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        query,
        params
    } = ctx;

    const {
        boardId
    } = params;
    const {
        sortType = 'byCtime'
    } = query;
    const response = await got({
        method: 'get',
        url: `https://www.zfrontier.com/board/${boardId}?sort=${sortType}&page=1`,
    });

    const {
        data
    } = response;
    const $ = cheerio.load(data);

    const boardTitle = $('.board-head-area h1').text();
    const list = $('.post-entry');
    ctx.state.data = {
        title: `${boardTitle} - 贴子列表 - zFrontier装备前线`,
        link: response.url,
        description: 'zFrontier 发烧友的最前线',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.post-title h2').text(),
                        description: `${item.find('.ellipsis').html()}<br/>${item.find('.imgs-wrap').html()}`,
                        link: `https://www.zfrontier.com${item.find('.post-title').attr('href')}`,
                        author: item.find('.author a').text(),
                        pubDate: new Date(item.find('.time').text()).toLocaleDateString(),
                    };
                })
                .get(),
    };
};
