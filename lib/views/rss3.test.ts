import { describe, expect, it } from 'vitest';
import rss3 from './rss3';

const NETWORK = 'rsshub';
const TAG = 'RSS';
const TYPE = 'feed';
const PLATFORM = 'RSSHub';

describe('rss3', () => {
    it('should return UMS Result', () => {
        const data = {
            item: [
                {
                    link: 'https://example.com/post1',
                    author: 'Author Name',
                    description: 'Description of the post',
                    pubDate: '2024-01-01T00:00:00Z',
                    category: 'Category Name',
                    title: 'Post Title',
                    updated: '2024-01-02T00:00:00Z',
                },
                {
                    link: 'https://example.com/post2',
                    author: 'Anaother Author',
                    description: 'Another description',
                    pubDate: '2024-01-03T00:00:00Z',
                    category: 'Another Category',
                    title: 'Another Post',
                    updated: '2024-01-02T00:00:00Z',
                },
            ],
        };

        const result = rss3(data);

        const expected = {
            data: [
                {
                    owner: 'example.com',
                    id: 'https://example.com/post1',
                    network: NETWORK,
                    from: 'example.com',
                    to: 'example.com',
                    tag: TAG,
                    type: TYPE,
                    direction: 'out',
                    feeValue: '0',
                    actions: [
                        {
                            tag: TAG,
                            type: TYPE,
                            platform: PLATFORM,
                            from: 'example.com',
                            to: 'example.com',
                            metadata: {
                                authors: [{ name: 'Author Name' }],
                                description: 'Description of the post',
                                pub_date: '2024-01-01T00:00:00Z',
                                tags: ['Category Name'],
                                title: 'Post Title',
                            },
                            related_urls: ['https://example.com/post1'],
                        },
                    ],
                    timestamp: 1_704_153_600,
                },
                {
                    owner: 'example.com',
                    id: 'https://example.com/post2',
                    network: NETWORK,
                    from: 'example.com',
                    to: 'example.com',
                    tag: TAG,
                    type: TYPE,
                    direction: 'out',
                    feeValue: '0',
                    actions: [
                        {
                            tag: TAG,
                            type: TYPE,
                            platform: PLATFORM,
                            from: 'example.com',
                            to: 'example.com',
                            metadata: {
                                authors: [{ name: 'Anaother Author' }],
                                description: 'Another description',
                                pub_date: '2024-01-03T00:00:00Z',
                                tags: ['Another Category'],
                                title: 'Another Post',
                            },
                            related_urls: ['https://example.com/post2'],
                        },
                    ],
                    timestamp: 1_704_153_600,
                },
            ],
        };
        expect(result).toStrictEqual(expected);
    });
});
