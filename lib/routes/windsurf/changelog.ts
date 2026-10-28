import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

function parseCalendarDate(value: string | undefined) {
    if (!value?.trim()) {
        return;
    }
    const date = parseDate(value.trim(), 'MMMM D, YYYY', 'en', true);
    return Number.isFinite(date.getTime()) ? timezone(date, 0) : undefined;
}
function parseLegacyPublicationDate(value: string | undefined) {
    if (!value?.trim()) {
        return;
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(value) && !Number.isFinite(parseDate(value.slice(0, 10), 'YYYY-MM-DD', true).getTime())) {
        return;
    }
    const calendarDate = /^[a-z]+ \d{1,2}, \d{4}$/i.test(value);
    const date = calendarDate ? parseDate(value, 'MMMM D, YYYY', 'en', true) : parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}
export const handler = async (ctx: Context): Promise<Data> => {
    const limit = getRouteLimit(ctx, 100);
    const baseUrl = 'https://windsurf.com';
    const targetUrl: string = new URL('changelog', baseUrl).href;
    const response = await ofetch.raw<string>(targetUrl);
    const currentUrl = response.url || targetUrl;
    const $: CheerioAPI = load(response._data!);
    const language = ($('html').attr('lang') ?? 'en') as Language;
    const title: string = $('title').text();
    const currentEntries = $('div.update-container');
    const legacyEntries = $('div[aria-label="changelog-layout"]');
    if (!currentEntries.length && !legacyEntries.length) {
        throw new Error(`Changelog entries not found at ${currentUrl}`);
    }
    const items: DataItem[] = currentEntries.length
        ? currentEntries
              .slice(0, limit)
              .toArray()
              .map((element) => {
                  const entry = $(element);
                  const version = entry.find('[data-component-part=update-label]').text();
                  const anchor = entry.attr('id');
                  if (!version.trim() || !anchor) {
                      throw new Error(`Changelog entry identity missing at ${currentUrl}`);
                  }
                  const description = entry.find('[data-component-part=update-content]').html();
                  const guid = `windsurf-${version}`;
                  return {
                      title: version,
                      description,
                      pubDate: parseCalendarDate(entry.find('[data-component-part=update-description]').text()),
                      link: `${currentUrl}#${anchor}`,
                      guid,
                      id: guid,
                      language,
                  };
              })
        : legacyEntries
              .slice(0, limit)
              .toArray()
              .map((el) => {
                  const $el: Cheerio<Element> = $(el).parent();
                  const version: string | undefined = $el.find('header div').first().text();
                  if (!version.trim()) {
                      throw new Error(`Changelog entry identity missing at ${currentUrl}`);
                  }
                  const h1: string | undefined = $el.find('article h1').text();
                  const title: string = [version, h1].filter(Boolean).join(' ');
                  const description = $el.find('article div').first()?.html();
                  const pubDateStr: string | undefined = $el.find('header div').last().text()?.trim();
                  const guid = `windsurf-${version.trim()}`;
                  const image: string | undefined = $el.find('article img').attr('src');
                  const processedItem: DataItem = {
                      title,
                      description,
                      pubDate: parseLegacyPublicationDate(pubDateStr),
                      link: targetUrl,
                      doi: $el.find('meta[name="citation_doi"]').attr('content'),
                      guid,
                      id: guid,
                      content: {
                          html: description,
                          text: $el.find('article div').first().text(),
                      },
                      image,
                      banner: image,
                      language,
                  };
                  return processedItem;
              });
    return {
        title,
        description: $('meta[property="og:description"]').attr('content'),
        link: currentUrl,
        item: items,
        image: $('meta[property="og:image"]').attr('content'),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};
export const route: Route = {
    path: '/changelog',
    name: 'Changelog',
    url: 'windsurf.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/windsurf/changelog',
    parameters: undefined,
    description: undefined,
    categories: ['programming'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['windsurf.com/changelog'],
            target: '/changelog',
        },
        {
            source: ['docs.devin.ai/desktop/changelog'],
            target: '/changelog',
        },
    ],
    view: ViewType.Articles,
};
