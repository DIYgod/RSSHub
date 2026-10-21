import { html } from 'hono/html';

import { config } from '@/config';
import type { DataItem } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import type { BasicResponse, ResponseData, Topic, TopicImage } from './types';

export async function customFetch<T extends BasicResponse<ResponseData>>(path: string, retryCount = 0): Promise<T['resp_data']> {
    const apiUrl = 'https://api.zsxq.com/v2';

    const response = await got(apiUrl + path, {
        headers: {
            cookie: `zsxq_access_token=${config.zsxq.accessToken};`,
        },
    });
    const { succeeded, code, resp_data }: T = response.data;
    if (succeeded) {
        return resp_data;
    }
    // sometimes the request will fail with code 1059, retry will solve the problem
    if (code === 1059 && retryCount < 3) {
        return customFetch(path, retryCount + 1);
    }
    throw new Error(`Knowledge Planet API request failed (code ${code ?? 'unknown'}). Check the access token and permission for this group or user.`);
}

function decodeTopicText(text: string) {
    try {
        return decodeURIComponent(text);
    } catch {
        return text;
    }
}

function renderTopicLink(href: string, title: string) {
    const label = decodeTopicText(title);
    try {
        const url = new URL(decodeTopicText(href));
        if (url.protocol === 'https:' || url.protocol === 'http:') {
            return String(html`<a href="${url.href}">${label}</a>`);
        }
    } catch {
        // Malformed encoded links retain their readable label.
    }
    return String(html`${label}`);
}

function parseTopicContent(text: string = '', images: TopicImage[] = []) {
    let result = text.replaceAll('\n', '<br>');
    result = result.replaceAll(/<e type="web" href="(.*?)" title="(.*?)" style="(.*?)" \/>/g, (_, href, title) => renderTopicLink(href, title));
    result = result.replaceAll(/<e type="hashtag".*?title="(.*?)" \/>/g, (_, title) => String(html`<span>${decodeTopicText(title)}</span>`));
    result += images
        .map((image) => {
            const url = image.original?.url ?? image.large?.url ?? image.thumbnail?.url;
            return url ? String(html`<img src="${url}" />`) : '';
        })
        .filter(Boolean)
        .join('<br>');
    return result;
}

export function generateTopicDataItem(topics: Topic[]): DataItem[] {
    return topics.map((topic) => {
        if (topic.topic_id === undefined || topic.topic_id === null) {
            throw new Error('Missing Knowledge Planet topic ID; no unique article URL is available.');
        }
        let description: string | undefined;
        let title = '';
        const url = `https://wx.zsxq.com/topic/${topic.topic_id}`;
        switch (topic.type) {
            case 'talk':
                title = topic.talk?.text ?? '文章';
                description = parseTopicContent(topic.talk?.text, topic.talk?.images);
                break;
            case 'q&a':
                title = topic.question?.text ?? '问答';
                description = parseTopicContent(topic.question?.text, topic.question?.images);
                description = `<blockquote>${String(html`${topic.question?.owner?.name ?? '匿名用户'}`)} 提问：${description}</blockquote>`;
                if (topic.answered) {
                    description += '<br>' + String(html`${topic.answer?.owner?.name ?? '匿名用户'}`) + ' 回答：<br><br>';
                    description += parseTopicContent(topic.answer?.text, topic.answer?.images);
                }
                break;
            case 'task':
                title = topic.task?.text ?? '作业';
                description = parseTopicContent(topic.task?.text, topic.task?.images);
                break;
            case 'solution':
                title = topic.solution?.text ?? '写作业';
                description = parseTopicContent(topic.solution?.text, topic.solution?.images);
                break;
            default:
                throw new Error('Unsupported Knowledge Planet topic type; update RSSHub or report this topic format.');
        }
        return {
            title: topic.title ?? title,
            description,
            pubDate: topic.create_time ? parseDate(topic.create_time) : undefined,
            link: url,
        };
    });
}
