import { type CheerioAPI, load } from 'cheerio';
import pMap from 'p-map';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const processFeed = (i, $, link) => {
    const title = $('h1').text();
    let content = $('div.story-container').eq(i);

    // Insert cover images.
    content.find('div.story-image > figure').each((_, e) => {
        const src = `https://thumbor.ftacademy.cn/unsafe/1340x754/${e.attribs['data-url']}`;

        $(`<img src=${src}>`).insertAfter(content.find('div.story-lead')[0]);
    });

    // Link to the source for subscriber-only articles.
    content.find('div#subscribe-now-container').each((_, e) => {
        $(`<br/><p>此文章为付费文章，会员<a href='${link}'>请访问网站阅读</a>。</p>`).insertAfter(content.find('div.story-body')[0]);
        $(e).remove();
    });

    // Extract article authors.
    let author = '';
    content.find('span.story-author > a').each((_, e) => {
        author += `${$(e).text()} `;
    });
    author = author.trim();

    // Remove duplicate metadata, advertisements, scripts, and navigation.
    content
        .find(
            'div.story-theme, h1.story-headline, div.story-byline, div.mpu-container-instory,script, div#story-action-placeholder, div.copyrightstatement-container, div.clearfloat, div.o-ads, h2.list-title, div.allcomments, div.logincomment, div.nologincomment'
        )
        .each((_, e) => {
            $(e).remove();
        });
    content = content.html();

    return { content, author, title };
};

const processQuiz = ($: CheerioAPI) => {
    const questions = $('#mbagym-container .gym-slides')
        .children('span')
        .filter((_, element) => $(element).find('.quizlist').length > 0);
    if (questions.length === 0) {
        return;
    }

    questions.find('script, style, .pagetitle').remove();
    questions.find('[onclick]').removeAttr('onclick');
    return questions
        .toArray()
        .map((element) => $.html(element))
        .join('');
};

const getData = async ({ site = 'www', channel }) => {
    let feed;

    if (channel) {
        channel = channel.toLowerCase();
        channel = channel.split('-').join('/');

        try {
            feed = await parser.parseURL(`https://${site}.ftchinese.com/rss/${channel}`);
        } catch (error) {
            throw new Error(`Unable to retrieve the FT Chinese RSS channel ${channel}. Check the channel path and source availability.`, { cause: error });
        }
    } else {
        feed = await parser.parseURL(`https://${site}.ftchinese.com/rss/feed`);
    }

    const candidates: Array<{ title: string; link: string; pubDate?: Date; description?: string; author?: string }> = feed.items.map((item) => ({
        ...item,
        link: item.link.replace('http://', 'https://'),
        pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
    }));
    const items = await pMap(
        candidates,
        (item) =>
            cache.tryGet(item.link, async () => {
                const response = await got.get(`${item.link}?full=y&archive`);

                const $ = load(response.data);
                const results: any[] = [];
                for (let i = 0; i < $('div.story-container').length; i++) {
                    results.push(processFeed(i, $, item.link));
                }

                if (results.length > 0) {
                    item.title = results[0].title;
                    item.description = results.map((result) => result.content).join('');
                    item.author = results[0].author;
                } else {
                    const quizContent = processQuiz($);
                    if (!quizContent) {
                        throw new Error(`FT Chinese page did not contain a supported public article or quiz: ${item.link}`);
                    }
                    item.description = quizContent;
                }
                return item;
            }),
        { concurrency: 1 }
    );

    return {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
    };
};

export default { getData };
