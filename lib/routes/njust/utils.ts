import got from '@/utils/got';
import playwright from '@/utils/playwright';

async function getContent(url, pptr = false) {
    if (pptr) {
        const context = await playwright();
        try {
            const page = await context.newPage();
            // 更改 window.navigator.webdriver 值以避开反爬
            // await page.evaluateOnNewDocument(() => {
            //     // eslint-disable-next-line no-undef
            //     Object.defineProperty(navigator, 'webdriver', {
            //         get: () => undefined,
            //     });
            // });
            await page.route('**/*', (route) => {
                const request = route.request();
                request.resourceType() === 'document' || request.resourceType() === 'script' ? route.continue() : route.abort();
            });
            await page.goto(url, {
                waitUntil: 'networkidle',
            });
            const content = await page.content();
            return content;
        } finally {
            await context.close();
        }
    }
    const response = await got(url);
    const data = response.data;
    return data;
}

export { getContent };
