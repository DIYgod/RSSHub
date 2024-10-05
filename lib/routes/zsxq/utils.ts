import got from '@/utils/got';
import type { TopicImage, Topic, BasicResponse, ResponseData } from './types';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
import type { DataItem } from '@/types';

export async function customFetch<T extends BasicResponse<ResponseData>>(path: string, retryCount = 0): Promise<T['resp_data']> {
    const apiUrl = 'https://api.zsxq.com/v2';

    const response = await got(apiUrl + path, {
        headers: {
            cookie: `zsxq_access_token=${config.zsxq.accessToken};`,
        },
    });
    const { succeeded, code, resp_data } = response.data as T;
    if (succeeded) {
        return resp_data;
    }
    // sometimes the request will fail with code 1059, retry will solve the problem
    if (code === 1059 && retryCount < 3) {
        return customFetch(path, ++retryCount);
    }
    throw new Error('something wrong');
}

function parseTopicContent(text: string = '', images: TopicImage[] = []) {
    let result = text.replaceAll('\n', '<br>');
    result = result.replaceAll(/<e type="web" href="(.*?)" title="(.*?)" \/>/g, (_, p1, p2) => `<a href=${decodeURIComponent(p1)}>${decodeURIComponent(p2)}</a>`);
    result = result.replaceAll(/<e type="hashtag".*?title="(.*?)" \/>/g, (_, p1) => {
        const title = decodeURIComponent(p1);
        return `<span>${title}</span>`;
    });
    result += images.map((image) => `<img src="${image.original?.url ?? image.large?.url ?? image.thumbnail?.url}">`).join('<br>');
    return result;
}

export function generateTopicDataItem(topics: Topic[]): DataItem[] {
    return topics.map((topic) => {
        let description: string | undefined;
        let title = '';
        switch (topic.type) {
            case 'talk':
                title = topic.talk?.text?.split('\n')[0] ?? '文章';
                description = parseTopicContent(topic.talk?.text, topic.talk?.images);
                break;
            case 'q&a':
                title = topic.question?.text?.split('\n')[0] ?? '问答';
                description = parseTopicContent(topic.question?.text, topic.question?.images);
                description = `<blockquote>${String(topic.question?.owner?.name ?? '匿名用户')} 提问：${description}</blockquote>`;
                if (topic.answered) {
                    description += '<br>' + topic.answer?.owner.name + ' 回答：<br><br>';
                    description += parseTopicContent(topic.answer?.text, topic.answer?.images);
                }
                break;
            case 'task':
                title = topic.task?.text?.split('\n')[0] ?? '作业';
                description = parseTopicContent(topic.task?.text, topic.task?.images);
                break;
            case 'solution':
                title = topic.solution?.text?.split('\n')[0] ?? '写作业';
                description = parseTopicContent(topic.solution?.text, topic.solution?.images);
                break;
            default:
        }
        return {
            title: topic.title ?? title,
            description,
            pubDate: parseDate(topic.create_time),
        };
    });
}
