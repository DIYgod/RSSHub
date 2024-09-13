import { CheerioAPI } from 'cheerio';
import { config } from '@/config';
import cache from '@/utils/cache';
import got from '@/utils/got';

const multiImagePrompt = {
    en: (count) => `${count} images in total`,
    zh: (count) => `共${count}张图`,
    'zh-tw': (count) => `共${count}張圖`,
    ko: (count) => `총 ${count}개의 이미지`,
    ja: (count) => `計${count}枚の画像`,
};

interface Tweet {
    user: {
        name: string;
        screen_name: string;
    };
    text: string;
    photos?: Array<{ url: string }>;
    created_at: string;
    favorite_count: number;
    conversation_count: number;
}

export async function processContent($: CheerioAPI, lang: string): Promise<string> {
    // 移除作者頭像
    $('.am__work__user-icon-container').remove();

    // 插畫標題&作者
    $('.am__work__title').attr('style', 'display: inline;');
    $('.am__work__user-name').attr('style', 'display: inline; margin-left: 10px;');

    // 處理多張圖片的提示
    $('.mic__label').each((_, elem) => {
        const $label = $(elem);
        const count = $label.text();
        const $workContainer = $label.parentsUntil('.am__work').last().parent();
        const $titleContainer = $workContainer.find('.am__work__title-container');

        $titleContainer.append(`<p style="float: right; margin: 0;">${multiImagePrompt[lang](count)}</p>`);
        $label.remove();
    });

    // 插畫間隔
    $('.article-item, ._feature-article-body__pixiv_illust').after('<br>');

    // Remove Label & Tags
    $('.arc__thumbnail-label').remove();
    $('.arc__footer-container').remove();

    // pixivision card
    $('article._article-card').each((_, article) => {
        const $article = $(article);

        const $thumbnail = $article.find('._thumbnail');
        const thumbnailStyle = $thumbnail.attr('style');
        const bgImageMatch = thumbnailStyle?.match(/url\((.*?)\)/);
        const imageUrl = bgImageMatch ? bgImageMatch[1] : '';

        $thumbnail.remove();

        if (imageUrl) {
            $article.prepend(`<img src="${imageUrl}" alt="Article thumbnail">`);
        }
    });

    // 處理 tweet
    const tweetPromises = $('.fab__script')
        .map(async (_, elem) => {
            const $elem = $(elem);
            const $blockquote = $elem.find('blockquote');
            const $link = $blockquote.children('a');
            const href = $link.attr('href');
            if (href) {
                const match = href.match(/\/status\/(\d+)/);
                if (match) {
                    const tweetId = match[1];
                    const tweetHtml = await processTweet(tweetId);
                    $elem.html(tweetHtml);
                    $blockquote.remove();
                }
            }
        })
        .toArray();

    await Promise.all(tweetPromises);

    return (
        $('.am__body')
            .html()
            ?.replace(/https:\/\/i\.pximg\.net/g, config.pixiv.imgProxy || '') || ''
    );
}

// Source: https://github.com/vercel/react-tweet/blob/main/packages/react-tweet/src/api/fetch-tweet.ts
function getToken(id: string) {
    return ((Number(id) / 1e15) * Math.PI).toString(6 ** 2).replaceAll(/(0+|\.)/g, '');
}

async function fetchTweet(id: string): Promise<Tweet | null> {
    const cachedTweet = await cache.tryGet(`twitter:tweet:${id}`, async () => {
        const url = new URL(`https://cdn.syndication.twimg.com/tweet-result`);
        url.searchParams.set('id', id);
        url.searchParams.set('token', getToken(id));

        try {
            const res = await got(url.toString());
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return await res.json();
        } catch {
            return null;
        }
    });

    if (cachedTweet && typeof cachedTweet === 'object' && 'user' in cachedTweet) {
        return cachedTweet as Tweet;
    }
    return null;
}

async function processTweet(id: string): Promise<string> {
    const tweet = await fetchTweet(id);
    if (!tweet) {
        return '';
    }

    const { user, text, photos, created_at, favorite_count, conversation_count } = tweet;
    const twitterUrl = `https://twitter.com/${user.screen_name}/status/${id}`;

    let html = `<div class="tweet">`;
    html += `<h3 style="margin:0;"><a href="https://twitter.com/${user.screen_name}">${user.name}</a> (@${user.screen_name})</h3>`;
    html += `<p style="margin:0;">${text}</p>`;

    if (photos && photos.length > 0) {
        html += `<div class="tweet-images">`;
        for (const photo of photos) {
            html += `<img src="${photo.url}" alt="Tweet image" style="max-width: 100%; height: auto;" />`;
        }
        html += `</div>`;
    }

    html += `<div class="tweet-metadata">`;
    html += `<span>❤️ ${favorite_count}</span> `;
    html += `<span>💬 ${conversation_count}</span> `;
    html += `</div>`;

    html += `<a href="${twitterUrl}" target="_blank">${new Date(created_at).toISOString().split('T')[0]}</a>`;
    html += `</div>`;

    return html;
}
