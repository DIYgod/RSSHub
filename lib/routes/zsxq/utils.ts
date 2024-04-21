import got from '@/utils/got';
import type { TopicImage, Topic, BasicResponse } from './types';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';

export async function customFetch<T extends BasicResponse<any>>(path: string, retryCount = 0): Promise<T['resp_data']> {
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
        return `<span>${title}</a>`;
    });
    result += images.map((image) => `<img src="${image.original?.url ?? image.large?.url ?? image.thumbnail?.url}">`).join('<br>');
    return result;
}

export function generateTopicDataItem(topics: Topic[]) {
    return topics.map((topic) => {
        let description: string | undefined;
        let title = '';
        switch (topic.type) {
            case 'talk':
                title = topic.talk?.text?.split('\n')[0] ?? '';
                description = parseTopicContent(topic.talk.text, topic.talk?.images);
                break;
            case 'q&a':
                title = 'Q&A';
                description = parseTopicContent(topic.question.text, topic.question?.images);
                break;
            case 'task':
                title = topic.task?.text?.split('\n')[0] ?? '';
                description = parseTopicContent(topic.task.text, topic.task?.images);
                break;
            default:
        }
        return {
            title,
            description,
            pubDate: parseDate(topic.create_time),
        };
    });
}
('');
