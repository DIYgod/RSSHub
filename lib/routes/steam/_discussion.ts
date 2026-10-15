import { type Cheerio, load } from 'cheerio';
import type { Element } from 'domhandler';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const steamCommunityUrl = 'https://steamcommunity.com';

export const fetchSteamDiscussionPage = (url: string): Promise<string> => ofetch(url, { query: { l: 'english' } });

const parsePost = (post: Cheerio<Element>, author: Cheerio<Element>, content: Cheerio<Element>, link: string) => ({
    link,
    author: [{ name: author.text().trim(), url: author.attr('href') }],
    pubDate: parseDate(post.find('.commentthread_comment_timestamp[data-timestamp]').attr('data-timestamp')!, 'X'),
    description: content.html()?.trim(),
});

export const parseDiscussionListPage = (html: string, listUrl: string) => {
    const $ = load(html);
    const appName = $('.apphub_AppName').text();
    if (!appName) {
        throw new InvalidParameterError(`Unable to read public Steam discussion forum for app ${listUrl}`);
    }

    return {
        appName,
        forumName: $('.rightbox_list_option.selected .forum_list_name').text(),
        topicLinks: $('.forum_topic a.forum_topic_overlay[href]')
            .toArray()
            .map((element) => element.attribs.href),
    };
};

export const parseDiscussionTopicPage = (html: string, topicUrl: string) => {
    const $ = load(html);
    const originalPost = $('.forum_op');
    if (!originalPost.length) {
        throw new InvalidParameterError(`Steam discussion topic ${topicUrl} was not found`);
    }
    const title = originalPost.find('.topic').text();

    return {
        appName: $('.apphub_AppName').text(),
        title,
        originalPost: {
            title,
            ...parsePost(originalPost, originalPost.find('.forum_op_author[href]'), originalPost.find('.content'), topicUrl),
        },
        replies: $('.commentthread_comment')
            .toArray()
            .map((element) => {
                const reply = $(element);
                const author = reply.find('.commentthread_author_link[href]');

                return {
                    title: `${title} — ${author.text()}`,
                    ...parsePost(reply, author, reply.find('.commentthread_comment_text'), `${topicUrl}#c${element.attribs.id.slice('comment_'.length)}`),
                };
            }),
        replyCount: Number($('[id$="_pagetotal"]').text()),
    };
};
