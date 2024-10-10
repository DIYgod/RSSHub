import { CheerioAPI } from 'cheerio';
import { config } from '@/config';

const multiImagePrompt = {
    en: (count) => `${count} images in total`,
    zh: (count) => `共${count}张图`,
    'zh-tw': (count) => `共${count}張圖`,
    ko: (count) => `총 ${count}개의 이미지`,
    ja: (count) => `計${count}枚の画像`,
};

export function processContent($: CheerioAPI, lang: string): string {
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
    $('.fab__script').each((_, elem) => {
        const $elem = $(elem);
        const $link = $elem.find('blockquote > a');
        const href = $link.attr('href');

        if (href) {
            const match = href.match(/\/status\/(\d+)/);
            if (match) {
                const tweetId = match[1];
                $elem.html(`
                <iframe
                    scrolling="no"
                    frameborder="0"
                    allowtransparency="true"
                    allowfullscreen="true"
                    class=""
                    style="position: static; visibility: visible; display: block; width: 550px; height: 1000px; flex-grow: 1;"
                    title="X Post"
                    src="https://platform.twitter.com/embed/Tweet.html?id=${tweetId}"
                ></iframe>
            `);
                $elem.find('blockquote').remove();
            }
        }
    });

    return (
        $('.am__body')
            .html()
            ?.replace(/https:\/\/i\.pximg\.net/g, config.pixiv.imgProxy || '') || ''
    );
}
