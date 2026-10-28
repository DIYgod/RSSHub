import { randomUUID } from 'node:crypto';

import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const baseUrl = 'https://lingowhale.com';
export const apiUrl = 'https://api-public.lingowhale.com/api/lingowhale/v1';
export const headers = { imei: `IMEI-${randomUUID().toUpperCase()}` };

export const parseChannel = (channel) => ({
    title: channel.name,
    description: channel.description,
    link: `${baseUrl}/channels?channel_id=${channel.channel_id}`,
    image: channel.surface_url,
    category: [`${channel.name} (channel:${channel.channel_id})`],
});

export const parseTopic = (topic) => ({
    title: topic.name,
    description: topic.hook,
    link: `${baseUrl}/topics?topic_id=${topic.topic_id}`,
    pubDate: parseDate(topic.last_update_time, 'X'),
    image: topic.surface_url,
});

const renderDescription = (entryType: number, resource) => {
    if (entryType === 12) {
        return renderAiSummary(resource);
    }
    // PDF content
    if (entryType === 10) {
        return `<p>${resource.content.replaceAll('\n', '<br>')}</p>`;
    }
    // 7, article content
    return load(resource.html)('body').html();
};

const renderAiSummary = (resource) => {
    const abstracts = resource.multi_abstract.map((section) => `<h3>${section.subject}</h3><p>${section.abstract}</p>`).join('');
    const viewpoints = resource.multi_viewpoint.flatMap((section) => section.multi_viewpoint.map((viewpoint) => `<li>${viewpoint.content}</li>`)).join('');
    return `${abstracts}<ul>${viewpoints}</ul>`.replaceAll('<hl>', '<b>').replaceAll('</hl>', '</b>');
};

export const fetchEntries = (feedList: Array<{ entry_id: string; entry_type: number; channel?: { name: string; channel_id: string } | null }>) =>
    Promise.all(
        feedList.map((entry) =>
            cache.tryGet(`lingowhale:entry:${entry.entry_id}`, async () => {
                const detail = await ofetch(`${apiUrl}/entry_detail/get`, {
                    method: 'POST',
                    body: {
                        entry_id: entry.entry_id,
                        entry_type: entry.entry_type,
                    },
                });
                const resource = detail.data.resource;

                return {
                    title: resource.title,
                    link: `${baseUrl}/reader/${entry.entry_type === 10 ? 'pdf' : 'web'}/${entry.entry_id}`,
                    description: renderDescription(entry.entry_type, resource),
                    author: resource.author.name,
                    pubDate: parseDate(resource.pub_time, 'X'),
                    image: resource.multimedia.surface_img,
                    category: entry.channel ? [`${entry.channel.name} (channel:${entry.channel.channel_id})`] : undefined,
                };
            })
        )
    ) as Promise<DataItem[]>;
