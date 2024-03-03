// @ts-nocheck
import got from '@/utils/got';
const { JSDOM } = require('jsdom');

export default async (ctx) => {
    const data = await got.get(`https://www.hotukdeals.com/`, {
        headers: {
            Referer: `https://www.hotukdeals.com/`,
        },
    });

    const dom = new JSDOM(data.data, {
        runScripts: 'dangerously',
    });
    const threads = dom.window.__INITIAL_STATE__.widgets.hottestWidget.threads;

    ctx.set('data', {
        title: `hotukdeals hottest`,
        link: `https://www.hotukdeals.com/`,
        item: threads.map((item) => ({
            title: item.title,
            description: `<img src="https://images.hotukdeals.com/${item.mainImage.path}/${item.mainImage.name}/re/768x768/qt/60/${item.mainImage.name}.jpg"><br>${item.temperature}° ${item.title}<br>${item.displayPrice}`,
            link: item.url,
        })),
    });
};
