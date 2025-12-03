import path from 'node:path';

import bbobHTML from '@bbob/html';
import presetHTML5 from '@bbob/preset-html5';
import type { BBobCoreTagNodeTree } from '@bbob/types';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

const rootUrl = 'https://instant.1point3acres.com';
const apiRootUrl = 'https://api.1point3acres.com';

const types = {
    new: '最新帖子',
    hot: '热门帖子',
};

const swapLinebreak = (tree: BBobCoreTagNodeTree) =>
    tree.walk((node) => {
        if (typeof node === 'string' && node === '\n') {
            return {
                tag: 'br',
                content: null,
            };
        }
        return node;
    });

const ProcessThreads = async (tryGet, apiUrl, order) => {
    const response = await got({
        method: 'get',
        url: apiUrl,
        headers: {
            referer: rootUrl,
        },
    });

    const items = await Promise.all(
        response.data.threads.map((item) => {
            const result = {
                guid: item.tid,
                title: item.subject,
                author: item.author,
                link: `${rootUrl}/thread/${item.tid}`,
                description: item.summary,
                pubDate: parseDate((order === '' ? item.lastpost : item.dateline) * 1000),
                category: [item.forum_name, ...(item.tags ? item.tags.map((t) => t.displayname) : [])],
            };

            return tryGet(result.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: `${apiRootUrl}/api/v3/threads/${result.guid}`,
                        headers: {
                            referer: rootUrl,
                        },
                    });

                    const thread = detailResponse.data.thread;

                    const customPreset = presetHTML5.extend((tags) => ({
                        ...tags,
                        attach: (node, { render }) => {
                            const id = render(node.content);
                            const attachment = thread.attachment_list.find((a) => a.aid === Number.parseInt(id));

                            if (attachment.isimage) {
                                return {
                                    tag: 'img',
                                    attrs: {
                                        src: attachment.url,
                                    },
                                };
                            }

                            return {
                                tag: 'a',
                                attrs: {
                                    href: `https://www.1point3acres.com/bbs/plugin.php?id=attachcenter:page&aid=${id}`,
                                    rel: 'noopener',
                                    target: '_blank',
                                },
                                content: `https://www.1point3acres.com/bbs/plugin.php?id=attachcenter:page&aid=${id}`,
                            };
                        },
                        url: (node) => {
                            const link = Object.keys(node.attrs as Record<string, string>)[0];
                            if (link.startsWith('https://link.1p3a.com/?url=')) {
                                const url = decodeURIComponent(link.replace('https://link.1p3a.com/?url=', ''));
                                return {
                                    tag: 'a',
                                    attrs: {
                                        href: url,
                                        rel: 'noopener',
                                        target: '_blank',
                                    },
                                    content: node.content,
                                };
                            }

                            return {
                                tag: 'a',
                                attrs: {
                                    href: link,
                                    rel: 'noopener',
                                    target: '_blank',
                                },
                                content: node.content,
                            };
                        },
                    }));

                    result.description = bbobHTML(thread.message_bbcode, [customPreset(), swapLinebreak]);

                    if (!thread.message_bbcode.includes('[attach]') && thread.attachment_list.length > 0) {
                        for (const a of thread.attachment_list) {
                            result.description +=
                                a.isimage === 1
                                    ? '<br>' +
                                      art(path.join(__dirname, 'templates/image.art'), {
                                          url: a.url,
                                          height: a.height,
                                          width: a.width,
                                      })
                                    : '';
                        }
                    }
                } catch {
                    // no-empty
                }

                return result;
            });
        })
    );

    return items;
};

export { apiRootUrl, ProcessThreads, rootUrl, types };
