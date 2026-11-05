import { getPlaywrightPage } from '@/utils/playwright';

type MediumBrowser = Awaited<ReturnType<typeof getPlaywrightPage>>;
export type GetMediumBrowser = () => Promise<MediumBrowser>;

export function isMediumChallenge(error: any) {
    const body = error?.data ?? error?.response?._data;
    const html = typeof body === 'string' ? body : body?.body;
    return (error?.statusCode ?? error?.status ?? error?.response?.status) === 403 && typeof html === 'string' && /cf-chl|challenge-platform|Just a moment/i.test(html);
}

async function createMediumBrowser(cookie: string) {
    const browser = await getPlaywrightPage('https://medium.com/', { noGoto: true, closeTimeout: 0 });
    try {
        await browser.context.route('**/*', async (route) => {
            await (['document', 'script', 'stylesheet', 'xhr', 'fetch'].includes(route.request().resourceType()) ? route.continue() : route.abort());
        });
        const cookies = cookie
            .split(';')
            .map((part) => part.trim())
            .filter((part) => part.indexOf('=') > 0)
            .map((part) => {
                const separator = part.indexOf('=');
                return { name: part.slice(0, separator), value: part.slice(separator + 1), url: 'https://medium.com/', secure: true };
            });
        await browser.context.addCookies(cookies);
        await browser.page.goto('https://medium.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });
        if (new URL(browser.page.url()).origin !== 'https://medium.com') {
            throw new Error('The Medium browser source redirected outside its expected origin.');
        }
        return browser;
    } catch (error) {
        await browser.destroy();
        throw error;
    }
}

export async function withMediumBrowser<T>(cookie: string, callback: (getBrowser: GetMediumBrowser) => Promise<T>) {
    let pending: Promise<MediumBrowser> | undefined;
    let browser: MediumBrowser | undefined;
    const getBrowser = async () => {
        browser = await (pending ??= createMediumBrowser(cookie));
        return browser;
    };
    try {
        return await callback(getBrowser);
    } finally {
        if (browser) {
            await browser.destroy();
        }
    }
}
