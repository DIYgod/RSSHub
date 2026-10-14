import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

const appsUrl = 'https://apps.qoo-app.com';
const newsUrl = 'https://news.qoo-app.com';
const notesUrl = 'https://notes.qoo-app.com';
const ssoUrl = 'https://sso.qoo-app.com';
const userUrl = 'https://user.qoo-app.com';

const siteIcon = 'https://o.qoo-img.com/statics.qoo-app.com/cdn/img/QooApp_512.v-0d0fd2.png';

const fixImg = ($) => {
    $('img').each((_, img) => {
        if (img.attribs['data-orig-file']) {
            img.attribs.src = img.attribs['data-orig-file'].replace('i0.wp.com/', '').split('?', 1)[0];
            delete img.attribs['data-orig-file'];
            delete img.attribs['data-orig-size'];
            delete img.attribs['data-image-meta'];
            delete img.attribs['data-comments-opened'];
            delete img.attribs['data-full-url'];
            delete img.attribs['data-medium-file'];
            delete img.attribs['data-large-file'];
        }
        img.attribs.src = img.attribs.src.replace('i0.wp.com/', '').split('?', 1)[0];
        delete img.attribs.srcset;
    });
};

const extractNotes = ($) =>
    $('.qoo-note-wrap')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.find('.qoo-note-view .content-title').text();
            const author = $item.find('cite.name').text();
            const pubDate = timezone(parseDate($item.find('time').text(), 'YYYY-MM-DD HH:mm'), 8);
            $item.find('cite.name, time, footer, .qoo-note-view .content-title').remove();
            return {
                title,
                description: $item.find('.qoo-note-view').html(),
                link: $item.find('a.link-wrap').attr('href'),
                pubDate,
                author,
            };
        });

export { appsUrl, extractNotes, fixImg, newsUrl, notesUrl, siteIcon, ssoUrl, userUrl };

export const createPageFetcher = () => {
    let instance: Awaited<ReturnType<typeof getPlaywrightPage>> | undefined;
    let queue = Promise.resolve('');
    let closed = false;
    const challengeHosts = new Set<string>();
    const get = async (link: string, searchParams: Record<string, string> = {}): Promise<string> => {
        const url = new URL(link);
        for (const [key, value] of Object.entries(searchParams)) {
            url.searchParams.set(key, value);
        }
        const { data } = await got(url.href);
        if (typeof data !== 'string' || !data.includes('AwsWafIntegration')) {
            return data;
        }
        const challenge = /<script[^>]+src="([^" ]+\/challenge\.js)"/.exec(data)?.[1];
        if (challenge) {
            const host = new URL(challenge).hostname;
            if (host.endsWith('.awswaf.com')) {
                challengeHosts.add(host);
            }
        }
        queue = (async () => {
            try {
                await queue;
            } catch {
                /* A failed request must not block the next queued request. */
            }
            if (closed) {
                throw new Error('The QooApp browser session has already closed');
            }
            instance ??= await getPlaywrightPage(url.href, {
                noGoto: true,
                closeTimeout: 0,
                onBeforeLoad: async (page) => {
                    await page.route('**/*', (request) => {
                        const host = new URL(request.request().url()).hostname;
                        const allowedHost = host.endsWith('.qoo-app.com') || challengeHosts.has(host);
                        return allowedHost && ['document', 'script', 'xhr', 'fetch'].includes(request.request().resourceType()) ? request.continue() : request.abort();
                    });
                },
            });
            await instance.page.goto(url.href, {
                waitUntil: 'domcontentloaded',
                timeout: 30000,
            });
            await instance.page.waitForSelector('head title:not(:empty)', {
                state: 'attached',
                timeout: 20000,
            });
            await instance.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
            return instance.page.content();
        })();
        return queue;
    };
    const close = async () => {
        closed = true;
        try {
            await queue;
        } catch {
            // The caller receives the original navigation failure.
        } finally {
            if (instance) {
                try {
                    await instance.page.close();
                } finally {
                    await instance.destroy();
                }
            }
        }
    };
    return { get, close };
};
