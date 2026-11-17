import { load } from 'cheerio';

// Cloudflare Workers have no threads, and enforce their own CPU and memory limits
export const parse = async (link: string, html: string) => {
    const { default: Parser } = await import('@jocmp/mercury-parser');
    return Parser.parse(link, { html: load(html).html(), fetchAllPages: false });
};
