import { load } from 'cheerio';
import dayjs from 'dayjs';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/chatgpt/release-notes',
    categories: ['program-update'],
    example: '/openai/chatgpt/release-notes',
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'ChatGPT - Release Notes',
    maintainers: ['xbot'],
    handler,
};

async function handler() {
    const articleUrl = 'https://help.openai.com/en/articles/6825453-chatgpt-release-notes';

    const cacheIn = await cache.tryGet(
        articleUrl,
        async () => {
            const browser = await puppeteer();
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
            });
            await page.goto(articleUrl, {
                waitUntil: 'domcontentloaded',
            });
            const html = await page.evaluate(() => document.documentElement.innerHTML);
            await page.close();

            const $ = load(html);
            const articleContent = $('.article-content');

            if (articleContent.length === 0) {
                throw new Error('Failed to find article content. Possible Cloudflare protection.');
            }

            const feedTitle = $('h1').first().text();
            const feedDesc = 'ChatGPT Release Notes';

            // Find h1 elements with dates inside article-content
            const items: DataItem[] = [];

            articleContent.find('h1').each((_, element) => {
                const $h1 = $(element);
                const text = $h1.text().trim();

                // Skip the title h1 (contains "ChatGPT — Release Notes")
                if (!/\w+\s+\d+[stndrh]*,\s+\d{4}/i.test(text)) {
                    return;
                }

                const dateMatch = text.match(/(\w+\s+\d+[stndrh]*,\s+\d{4})/i);
                let pubDate: Date | undefined;
                if (dateMatch) {
                    const dateStr = dateMatch[1];
                    const parsedDate = dayjs(dateStr, ['MMMM Do, YYYY', 'MMMM D, YYYY'], 'en');
                    if (parsedDate.isValid()) {
                        pubDate = parsedDate.toDate();
                    }
                }

                const titleText = text;
                let description = '';

                $h1.nextUntil('h1').each((_, sib) => {
                    const $sib = $(sib);
                    const tagName = sib.tagName.toLowerCase();

                    switch (tagName) {
                        case 'h2':
                        case 'h3':
                        case 'h4':
                        case 'h5':
                        case 'h6':
                            description += `<${tagName}>${$sib.html()?.trim() || ''}</${tagName}>`;
                            break;

                        case 'ul':
                        case 'ol': {
                            const listItems = $sib
                                .find('li')
                                .toArray()
                                .map((li) => {
                                    const $li = $(li);
                                    const liHtml = $li.html()?.trim();
                                    return liHtml ? `<li>${liHtml}</li>` : null;
                                })
                                .filter(Boolean);
                            if (listItems.length > 0) {
                                description += `<${tagName}>${listItems.join('')}</${tagName}>`;
                            }
                            break;
                        }

                        case 'p': {
                            const pHtml = $sib.html()?.trim();
                            if (pHtml) {
                                description += `<p>${pHtml}</p>`;
                            }
                            break;
                        }

                        case 'br':
                            description += '<br>';
                            break;

                        default: {
                            const html = $sib.html()?.trim();
                            if (html) {
                                description += html;
                            }
                        }
                    }
                });

                items.push({
                    guid: `${articleUrl}#${pubDate ? pubDate.getTime() : titleText}`,
                    title: titleText,
                    link: articleUrl,
                    pubDate,
                    description,
                });
            });

            await browser.close();

            return { feedTitle, feedDesc, items };
        },
        86400,
        false
    );

    return {
        title: cacheIn.feedTitle,
        description: cacheIn.feedDesc,
        link: articleUrl,
        item: cacheIn.items,
    };
}
