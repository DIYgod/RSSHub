import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import type { TopicsResponse } from './types';
import { customFetch, generateTopicDataItem } from './utils';

describe('zsxq response parsing', () => {
    it('preserves topic IDs beyond the safe integer range', async () => {
        const { default: server } = await import('@/setup.test');
        server.use(
            http.get('https://api.zsxq.com/v2/groups/88855458825252/topics', () =>
                HttpResponse.text('{"succeeded":true,"resp_data":{"topics":[{"topic_id":55522458445228254,"type":"talk","create_time":"2026-07-26T00:00:00.000+0800","talk":{"text":"Test topic"}}]}}', {
                    headers: {
                        'content-type': 'application/json',
                    },
                })
            )
        );

        const { topics } = await customFetch<TopicsResponse>('/groups/88855458825252/topics');
        const [item] = generateTopicDataItem(topics);

        expect(topics[0].topic_id).toBe('55522458445228254');
        expect(item.link).toBe('https://wx.zsxq.com/topic/55522458445228254');
    });
});
