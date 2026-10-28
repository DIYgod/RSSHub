import playwright from '@/utils/playwright';
import { getCookies } from '@/utils/playwright-utils';

// Read the public page cookies for subsequent requests.
export default async function getCookie(host) {
    const context = await playwright();
    try {
        const page = await context.newPage();
        await page.route('**/*', (route) => {
            const request = route.request();
            request.resourceType() === 'document' || request.resourceType() === 'script' ? route.continue() : route.abort();
        });

        await page.goto(host, {
            waitUntil: 'networkidle',
        });
        return await getCookies(page);
    } finally {
        await context.close();
    }
}
