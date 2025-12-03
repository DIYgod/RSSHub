import { destr } from 'destr';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://hub.baai.ac.cn';
const eventUrl = 'https://event.baai.ac.cn';
const apiHost = 'https://hub-api.baai.ac.cn';

const getTagsData = () =>
    cache.tryGet('baai:tags', async () => {
        const { data } = await ofetch(`${apiHost}/api/v1/tags`);
        return data.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            brief: item.brief,
            iconUrl: item.icon_url,
        }));
    });

const parseItem = (item) => ({
    link: item.is_event ? `${eventUrl}/activities/${item.event_info.id}` : `${baseUrl}/view/${item.story_id}`,
    title: item.is_event ? item.event_info.name : item.story_info.title,
    pubDate: timezone(parseDate(item.is_event ? item.event_info.time_desc : item.story_info.created_at.replace('发布', '').replace('分享', '')), 8),
    author: item.is_event ? item.event_info.company : item.story_info.user_name,
    category: item.is_event ? null : item.story_info.tag_names.map((tag) => tag.title),
    eventId: item.is_event ? item.event_info.id : null,
});

const parseEventDetail = async (item) => {
    const data = await ofetch(`${eventUrl}/api/api/Activity/IntroductionTypes`, {
        query: {
            activityId: item.eventId,
        },
        parseResponse: (txt) => destr(txt),
    });
    return data.data.ac_desc + data.data.ac_desc_two;
};

export { apiHost, baseUrl, eventUrl, getTagsData, parseEventDetail, parseItem };
