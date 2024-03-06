import asyncPool from 'tiny-async-pool';

const ProcessFeed = async (items, cookies, browser, limit, cache) => {
    let newCookies = [];
    const result = [];
    for await (const item of asyncPool(3, items.slice(0, limit), async (i) => {
        const url = `https://www.dcard.tw/service/api/v2/posts/${i.id}`;
        const content = await cache.tryGet(`dcard:${i.id}`, async () => {
            let response;
            // try catch 处理被删除的帖子
            try {
                const page = await browser.newPage();
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'fetch' || request.resourceType() === 'xhr' ? request.continue() : request.abort();
                });
                await page.setExtraHTTPHeaders({
                    referer: `https://www.dcard.tw/f/${i.forumAlias}/p/${i.id}`,
                });
                await page.setCookie(...cookies);
                await page.goto(url);
                await page.waitForSelector('body > pre');
                response = await page.evaluate(() => document.querySelector('body > pre').textContent);
                newCookies = await page.cookies();
                await page.close();

                const data = JSON.parse(response);
                let body = data.content;
                body = body.replaceAll(/(?=https?:\/\/).*?(?<=\.(jpe?g|gif|png))/gi, (m) => `<img src="${m}">`);
                body = body.replaceAll(/(?=https?:\/\/).*(?<!jpe?g"?>?)$/gim, (m) => `<a href="${m}">${m}</a>`);
                body = body.replaceAll('\n', '<br>');

                return body;
            } catch {
                return '';
            }
        });

        i.description = content;
        return i;
    })) {
        result.push(item);
    }
    await cache.set('dcard:cookies', newCookies, 3600);
    return [...result, ...items.slice(limit)];
};

export default { ProcessFeed };
