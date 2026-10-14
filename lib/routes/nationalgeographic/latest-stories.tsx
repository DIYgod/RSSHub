import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const findNatgeo = ($) =>
    JSON.parse(
        $('script')
            .text()
            .match(/\['__natgeo__'\]=(\{.*?\});/)[1]
    );

type StoryMedia = {
    src?: string;
    altText?: string;
};

type StoryImage = {
    image?: StoryMedia;
    altText?: string;
    caption?: string;
};

type StoryInlineContent = {
    cmsType?: string;
    image?: StoryMedia;
    caption?: string;
    images?: StoryImage[];
    note?: string;
    text?: string;
    quote?: string;
    src?: string;
    title?: string;
    description?: string;
};

type StoryBlock = {
    type?: string;
    cntnt?: {
        mrkup?: string;
        cmsType?: string;
    } & StoryInlineContent;
};

type StoryData = {
    ldMda?: {
        image?: StoryMedia;
        caption?: string;
    };
    description?: string;
    body?: StoryBlock[];
};

const renderStoriesDescription = ({ ldMda, description, body }: StoryData) =>
    renderToString(
        <>
            {ldMda?.image?.src ? (
                <figure>
                    <img src={ldMda.image.src} alt={ldMda.image.altText} />
                    <figcaption>{ldMda.caption}</figcaption>
                </figure>
            ) : null}
            {description ? (
                <p>
                    <b>{description}</b>
                </p>
            ) : null}
            {body?.length
                ? body.map((block) => {
                      if (block.type === 'p') {
                          return <p>{block.cntnt?.mrkup ? raw(block.cntnt.mrkup) : null}</p>;
                      }
                      if (block.type !== 'inline') {
                          return null;
                      }

                      const content = block.cntnt;
                      switch (content?.cmsType) {
                          case 'image':
                              return content.image?.src ? (
                                  <figure>
                                      <img src={content.image.src} alt={content.image.altText} />
                                      <figcaption>{content.caption ? raw(content.caption) : null}</figcaption>
                                  </figure>
                              ) : null;
                          case 'imagegroup':
                              return content.images?.map((image) =>
                                  image.image?.src ? (
                                      <figure>
                                          <img src={image.image.src} alt={image.image.altText} />
                                          <figcaption>{image.caption ? raw(image.caption) : null}</figcaption>
                                      </figure>
                                  ) : null
                              );
                          case 'editorsNote':
                              return content.note ? <p>{raw(content.note)}</p> : null;
                          case 'listicle':
                              return content.text ? <p>{raw(content.text)}</p> : null;
                          case 'pullquote':
                              return content.quote ? <blockquote>{raw(content.quote)}</blockquote> : null;
                          case 'source':
                              return content.src ? <a href={content.src}>{content.src}</a> : null;
                          case 'video':
                              return content.image?.src ? (
                                  <figure>
                                      <img src={content.image.src} alt={content.image.altText} />
                                      {content.title ? <figcaption>{raw(content.title)}</figcaption> : null}
                                      {content.description ? <figcaption>{raw(content.description)}</figcaption> : null}
                                  </figure>
                              ) : null;
                          default:
                              return null;
                      }
                  })
                : null}
        </>
    );

export const route: Route = {
    path: '/latest-stories',
    categories: ['travel'],
    example: '/nationalgeographic/latest-stories',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.nationalgeographic.com/pages/topic/latest-stories'],
        },
    ],
    name: 'Latest Stories',
    maintainers: ['miles170'],
    handler,
    url: 'www.nationalgeographic.com/pages/topic/latest-stories',
};

async function handler() {
    const currentUrl = 'https://www.nationalgeographic.com/pages/topic/latest-stories';
    const response = await got(currentUrl);
    const $ = load(response.data);
    const list: DataItem[] = findNatgeo($)
        .page.content.hub.frms.flatMap((e) => e.mods)
        .flatMap((m) => m.tiles?.filter((t) => t.ctas[0]?.text === 'natgeo.ctaText.read'))
        .filter(Boolean)
        .map((i) => ({
            title: i.title,
            link: i.ctas[0].url,
            category: i.tags.map((t) => t.name),
        }));
    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`nationalgeographic:article:v3:${item.link}`, async () => {
                const response = await got(item.link!);
                const $ = load(response.data);
                const mods = findNatgeo($).page.content.prismarticle.frms.find((f) => f.cmsType === 'ArticleBodyFrame').mods;
                const bodyTile = mods.find((m) => m.edgs[0].cmsType === 'ArticleBodyTile').edgs[0];

                const author = bodyTile.cntrbGrp
                    .flatMap((c) => c.contributors)
                    .map((c) => c.displayName)
                    .join(', ');
                const description = renderStoriesDescription({
                    ldMda: bodyTile.ldMda,
                    description: bodyTile.dscrptn,
                    body: bodyTile.bdy,
                });
                const pubDate = bodyTile.pbDt ? parseDate(bodyTile.pbDt) : undefined;

                return { author, description, pubDate };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: $('meta[property="og:title"]').attr('content')!,
        link: currentUrl,
        item: items.filter((item) => item !== null),
    };
}
