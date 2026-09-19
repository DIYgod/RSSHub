import { load } from 'cheerio';

export function getForumUrl(html: string) {
    const $ = load(html);
    const button = $('.button').first();
    const target = button.attr('href') || button.attr('onclick')?.match(/window\.open\(\s*(['"])(.*?)\1/)?.[2];
    if (!target) {
        throw new Error('The 2048 address page did not contain a forum link.');
    }
    const url = new URL(target, 'https://2048.info');
    if (!['https:', 'http:'].includes(url.protocol)) {
        throw new Error('The 2048 address page contained an unsupported forum URL.');
    }
    return url.href;
}
