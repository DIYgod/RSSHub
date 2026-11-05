import { getPlaywrightPage, type Page } from '@/utils/playwright';

export class SourceClient {
    private page?: Page;
    private destroy?: () => Promise<void>;

    async get<T = string>(url: string): Promise<T> {
        if (!this.page) {
            const instance = await getPlaywrightPage(url, {
                noGoto: true,
                closeTimeout: 0,
                onBeforeLoad: async (page) => {
                    await page.route('**/*', (route) => (['document', 'script'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
                },
            });
            this.page = instance.page;
            this.destroy = instance.destroy;
        }
        const response = await this.page.goto(url, { waitUntil: 'networkidle' });
        if (!response?.ok()) {
            throw new Error(`UMass source request failed (${response?.status() ?? 'no response'}): ${url}`);
        }
        const content = await response.text();
        return (response.headers()['content-type']?.includes('application/json') ? JSON.parse(content) : content) as T;
    }

    async close() {
        await this.destroy?.();
    }
}
