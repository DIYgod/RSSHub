import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const rootUrl = 'https://hk01.com';
const apiRootUrl = 'https://web-data.api.hk01.com';

const renderToken = (token) => {
    if (token.type === 'text') {
        return token.content;
    }
    if (token.type === 'link') {
        return <a href={token.link}>{token.content}</a>;
    }
    if (token.type === 'boldText') {
        return <b>{token.content}</b>;
    }
    if (token.type === 'boldLink') {
        return (
            <a href={token.link}>
                <b>{token.content}</b>
            </a>
        );
    }
    return null;
};

const renderText = (lines) =>
    lines?.map((tokens) => {
        if (tokens.length === 1 && tokens[0].type === 'h2') {
            return <h2>{tokens[0].content}</h2>;
        }
        if (tokens.length === 1 && tokens[0].type === 'h3') {
            return <h3>{tokens[0].content}</h3>;
        }
        return <p>{tokens.map(renderToken)}</p>;
    });

const renderDescription = ({ image, teasers, blocks }) =>
    renderToString(
        <>
            {image ? <img src={image} /> : null}
            {teasers?.length ? (
                <blockquote>
                    {teasers.map((teaser) => (
                        <p>{teaser}</p>
                    ))}
                </blockquote>
            ) : null}
            {blocks?.length
                ? blocks.map((block) => {
                      if (block.blockType === 'summary') {
                          return (
                              <blockquote>
                                  {block.summary?.map((summary) => (
                                      <p>{summary}</p>
                                  ))}
                              </blockquote>
                          );
                      }

                      if (block.blockType === 'text') {
                          return renderText(block.htmlTokens);
                      }

                      if (block.blockType === 'table' || block.blockType === 'code') {
                          return raw(block.htmlString ?? '');
                      }

                      if (block.blockType === 'faq') {
                          return block.questionsAndAnswers?.map(({ question, answer }) => (
                              <section>
                                  {renderText(question?.htmlTokens)}
                                  {renderText(answer?.htmlTokens)}
                              </section>
                          ));
                      }

                      if (block.blockType === 'quote') {
                          return (
                              <q>
                                  {block.message}
                                  {block.author ? ` —— ${block.author}` : ''}
                              </q>
                          );
                      }

                      if (block.blockType === 'image') {
                          const { image: blockImage } = block;

                          return blockImage ? (
                              <figure>
                                  <figcaption>{blockImage.caption}</figcaption>
                                  <img src={blockImage.cdnUrl} alt={blockImage.caption} height={blockImage.originalHeight} width={blockImage.originalWidth} />
                              </figure>
                          ) : null;
                      }

                      if (block.blockType === 'gallery') {
                          return block.images?.map((blockImage) => (
                              <figure>
                                  <figcaption>{blockImage.caption}</figcaption>
                                  <img src={blockImage.cdnUrl} alt={blockImage.caption} height={blockImage.originalHeight} width={blockImage.originalWidth} />
                              </figure>
                          ));
                      }

                      return null;
                  })
                : null}
        </>
    );

const ProcessItems = (items, ctx) => {
    const limit = getRouteLimit(ctx, 50);
    const candidateLimit = ctx.req.query('sorted') === 'false' ? limit : Math.max(50, limit);
    return pMap<DataItem & { link: string }, DataItem>(
        items
            .filter((item) => item.type !== 2)
            .slice(0, candidateLimit)
            .map((item) => ({
                title: item.data.title,
                link: `${rootUrl}/sns/article/${item.data.articleId}`,
                pubDate: parseDate(item.data.publishTime * 1000),
                category: item.data.tags.map((t) => t.tagName),
                author: item.data.authors.map((a) => a.publishName).join(', '),
            })),
        async (item) => ({
            ...item,
            description: await cache.tryGet(`hk01:article-body:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = load(detailResponse.data);
                const payload = $('script#__NEXT_DATA__').text();
                if (!payload) {
                    throw new Error(`The Hong Kong 01 article is missing its source data: ${item.link}`);
                }
                const content = JSON.parse(payload);
                const article = content.props?.initialProps?.pageProps?.article;
                if (!article) {
                    throw new Error(`The Hong Kong 01 source data is missing the article: ${item.link}`);
                }

                return renderDescription({
                    image: article.originalImage?.cdnUrl,
                    teasers: article.teaser,
                    blocks: article.blocks,
                });
            }),
        }),
        { concurrency: 3 }
    );
};

export { apiRootUrl, ProcessItems, rootUrl };
