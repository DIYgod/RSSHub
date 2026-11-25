import pMap from 'p-map';

const ProcessFeed = async (items, cookies, context, limit, cache) => {
    let newCookies = [];
    const result = await pMap(
        items.slice(0, limit),
        async (i: { id: number; forumAlias: string; description?: string }) => {
            const url = `https://www.dcard.tw/service/api/v2/posts/${i.id}`;
            const content = await cache.tryGet(`dcard:${i.id}`, async () => {
                const page = await context.newPage();
                try {
                    await page.route('**/*', (route) => {
                        const request = route.request();
                        request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'fetch' || request.resourceType() === 'xhr' ? route.continue() : route.abort();
                    });
                    await page.setExtraHTTPHeaders({
                        referer: `https://www.dcard.tw/f/${i.forumAlias}/p/${i.id}`,
                    });
                    await page.context().addCookies(cookies);
                    await page.goto(url);
                    await page.waitForSelector('body > pre');
                    const response = await page.evaluate(() => document.querySelector('body > pre')!.textContent);
                    newCookies = await page.context().cookies();

                    const data = JSON.parse(response);
                    let body = data.content;
                    body = body.replaceAll(/(?=https?:\/\/).*?(?<=\.(jpe?g|gif|png))/gi, (m) => `<img src="${m}">`);
                    body = body.replaceAll(/(?=https?:\/\/).+(?<!jpe?g"?>?)$/gim, (m) => `<a href="${m}">${m}</a>`);
                    body = body.replaceAll('\n', '<br>');

                    return body;
                } catch {
                    return '';
                } finally {
                    await page.close();
                }
            });

            i.description = content;
            return i;
        },
        { concurrency: 3 }
    );
    await cache.set('dcard:cookies', newCookies, 3600);
    return [...result, ...items.slice(limit)];
};

export default { ProcessFeed };
