const cheerio = require('cheerio');
const { formatItem } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();

    const timerPromise = new Promise((resolve) => setTimeout(resolve, 1000));
    await timerPromise;

    const data = await new Promise((resolve) => {
        const result = {
            name: null,
            description: null,
            list: null,
        };

        page.goto(`https://www.iesdouyin.com/share/user/${id}`)
            .then(() => {
                page.click('.user-tab').catch(() => {});
            })
            .catch(() => {});

        page.on('response', (response) => {
            const req = response.request();
            if (req.url().match(`www.iesdouyin.com/share/user/${id}`)) {
                response.text().then((text) => {
                    const $ = cheerio.load(text);
                    result.name = $('.nickname').text();
                    result.description = $('.signature').text();
                    if (result.list) {
                        resolve(result);
                        browser.close();
                    }
                });
            } else if (req.url().match('www.iesdouyin.com/web/api/v2/aweme/post')) {
                response.json().then((data) => {
                    result.list = data;
                    if (result.name) {
                        resolve(result);
                        browser.close();
                    }
                });
            }
        });
    });

    ctx.state.data = {
        title: `${data.name}的抖音`,
        link: `https://www.iesdouyin.com/share/user/${id}`,
        description: data.description,
        item: data.list && data.list.aweme_list.map(formatItem),
    };
};
