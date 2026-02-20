import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/manga/:id',
    categories: ['anime'],
    example: '/comicfuz/manga/218',
    parameters: { id: 'ComicFuz中对应的漫画id' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['comic-fuz.com/manga/:id'],
            target: '/manga/:id',
        },
    ],
    name: 'ComicFuz漫画详情',
    maintainers: ['xiaobailoves'],

    handler: async (ctx) => {
        const { id } = ctx.req.param();
        const baseurl = 'https://comic-fuz.com';
        const openurl = `${baseurl}/manga/${id}`;

        let browser;

        try{
            browser = await puppeteer();
        }catch (error: any) {
            throw new Error(`[ComicFuz] browser error: ${error.message}`, { cause: error });
        }

        const page = await browser.newPage();

        await page.setExtraHTTPHeaders({
            'Referer': 'https://comic-fuz.com/',
            'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8'
        });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        try {
            await page.goto(openurl, { waitUntil: 'domcontentloaded', timeout: 60000 });

            const nextData = await page.evaluate(() => {
                const element = document.querySelector('#__NEXT_DATA__');
                if (element && element.textContent) {
                    try {
                        return JSON.parse(element.textContent);
                    } catch {
                        return null;
                    }
                }
                return null;
            });

            if (!nextData || !nextData.props?.pageProps) {
                throw new Error('无法解析页面数据，请检查漫画 ID 是否正确或页面结构是否变动');
            }

            let mangaTitle = await page.title(); // 标题
            mangaTitle = mangaTitle.trim();

            let mangaAuthor = 'null'; // 作者
            try {
                await page.waitForSelector('[class*="AuthorTag_author__name__"]', { timeout: 6000 });
                const authorText = await page.$eval('[class*="AuthorTag_author__name__"]', (el) => el.textContent);
                if (authorText) {
                    mangaAuthor = authorText.trim();
                    // console.log(`[ComicFuz] Author: ${mangaAuthor}`);
                }
            } catch {
                // console.log('[ComicFuz] Author: null'); // 没找到输出null
            }

            let mangaDescription = 'null'; // 简介
            try {
                await page.waitForSelector('[class*="title_detail_introduction__description__"]', { timeout: 6000 });
                const descriptionText = await page.$eval('[class*="title_detail_introduction__description__"]', (el) => el.textContent);
                if (descriptionText) {
                    mangaDescription = descriptionText.trim();
                    // console.log(`[ComicFuz] Manga Description : ${mangaDescription}`);
                }
            } catch {
                // console.log('[ComicFuz] Manga Description: null'); // 没找到输出null
            }

            const pageProps = nextData.props.pageProps;
            const chapterGroups = pageProps.chapters || [];

            const allChapters: any[] = [];
            for (const group of chapterGroups) {
                if (group.chapters && Array.isArray(group.chapters)) {
                    allChapters.push(...group.chapters);
                }
            }

            const items = allChapters.map((chapter: any) => {

                const pointInfo = chapter.pointConsumption;
                const amount = pointInfo?.amount || 0;

                let statusText = 'null';
                if (pointInfo && Object.keys(pointInfo).length === 0) {
                    statusText = '无料';
                } else if (amount > 0) {
                    statusText = '付费';
                }

                let thumb = chapter.thumbnailUrl;
                if (thumb && !thumb.startsWith('http')) {
                    thumb = `${baseurl}${thumb.startsWith('/') ? '' : '/'}${thumb}`;
                }

                const fullTitle = `${chapter.chapterMainName}${chapter.chapterSubName ? ` - ${chapter.chapterSubName}` : ''}`;

                return {
                    title: fullTitle,
                    link: `${baseurl}/manga/viewer/${chapter.chapterId}`,
                    description: `
                        ${thumb ? `<img src="${thumb}" style="max-width: 100%;"><br>` : ''}
                        <p>💬 ${chapter.numberOfComments || 0} | ❤️ ${chapter.numberOfLikes || 0 }</p>
                        ${amount > 0 ? `<p>价格: ${amount} 金币/铜币</p>` : ''}
                    `,
                    guid: `comicfuz-comic-id-${chapter.chapterId}`,
                    category: [statusText],
                    author: mangaAuthor,
                    pubDate: chapter.updatedDate ? parseDate(chapter.updatedDate, 'YYYY/MM/DD') : new Date(),
                };
            });

            items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

            return {
                title: `COMIC FUZ - ${mangaTitle}`,
                link: openurl,
                description: mangaDescription,
                item: items,
                language: 'ja',
            };
        } finally {
            await browser.close();
        }
    },
};
