import logger from '@/utils/logger';
export async function zjzwfwCrawler(item: any, browser: any): Promise<string> {
    try {
        const page = await browser.newPage();
        let response = '';
        try {
            let navigationSuccess = false;
            const navigationAttempt = async (attempt) => {
                if (attempt >= 3) {
                    return false;
                }
                try {
                    await page.goto(item.link, {
                        waitUntil: 'networkidle2',
                        timeout: 60000,
                    });
                    return true;
                } catch {
                    if (attempt < 3) {
                        await new Promise((resolve) => setTimeout(resolve, 5000));
                        if (page.isClosed()) {
                            throw new Error('Navigation frame was detached');
                        }
                        return navigationAttempt(attempt + 1);
                    }
                    return false;
                }
            };

            navigationSuccess = await navigationAttempt(0);

            if (!navigationSuccess) {
                throw new Error('Navigation failed after retries');
            }

            if (page.isClosed()) {
                throw new Error('Page was closed unexpectedly');
            }
            await page.locator('.item-left .item .title .button').click();

            response = await page.content();
        } catch (error) {
            logger.error('Page Error when visiting /gov/hangzhou/zwfw:', error);
        } finally {
            if (!page.isClosed()) {
                await page.close();
            }
        }
        return response || '';
    } catch (error) {
        logger.error('Error when visiting /gov/hangzhou/zwfw:', error);
    }
    return '';
}
