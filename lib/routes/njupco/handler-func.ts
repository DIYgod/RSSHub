import * as cheerio from 'cheerio';

export async function handler() {
    interface NewItem {
        title: string,
        link: string | undefined,
        description: string | null,
    };
    const targetUrl = 'http://www.njupco.com/news/press';
    const $ = await cheerio.fromURL(targetUrl);
    const items: NewItem[] = [];
    const promises: Promise<void>[] = [];
    $('div.left_con ul li').each((_, el) => {
        const linkUrl = $(el).children('b').children('a').attr('href');
        if (linkUrl?.includes('weixin') === true) {
            const content = $(el).children('div').text();
            const lin = $(el).children('b').children('a').attr('href');
            const item: NewItem = {
                title: $(el).children('b').children('a').text(),
                link: lin,
                description: content + `<a href=${lin}>点击阅读微信公众号原文</a>`,
            };
            items.push(item);
        } else {
            const contentUrl = `http://www.njupco.com${linkUrl}`;
            const promise =  cheerio.fromURL(contentUrl)
            .then(($content) => {
                const content = $content('div.content').html();
                const item: NewItem = {
                    title: $(el).children('b').children('a').text(),
                    link: $(el).children('b').children('a').attr('href'),
                    description: content,
                };
                items.push(item);
            });
            promises.push(promise);
        };
    });

    await Promise.all(promises);

    return {
        title: '南京大学出版社',
        link: 'http://www.njupco.com/news/press',
        item: items,
    };
};