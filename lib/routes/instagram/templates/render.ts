import { parseDate } from '@/utils/parse-date';

import { renderImages } from './images';
import { renderVideo } from './video';

export const renderItems = (items) =>
    items.map((item) => {
        const productType = item.product_type; // carousel_container, feed, clips, igtv, longform, story
        // Content
        const summary = item.caption?.text ?? '';

        let description: string;
        switch (productType) {
            case 'carousel_container': {
                const images = item.carousel_media.map((i) => ({
                    ...i.image_versions2.candidates.toSorted((a, b) => b.width - a.width)[0],
                    alt: item.accessibility_caption,
                }));
                description = renderImages({
                    summary,
                    images,
                });
                break;
            }
            case 'clips':
            case 'igtv':
            case 'longform':
                description = renderVideo({
                    summary,
                    image: item.image_versions2.candidates.toSorted((a, b) => b.width - a.width)[0].url,
                    video: item.video_versions[0],
                });
                break;
            case 'feed': {
                const images = [{ ...item.image_versions2.candidates.toSorted((a, b) => b.width - a.width)[0], alt: item.accessibility_caption }];
                description = renderImages({
                    summary,
                    images,
                });
                break;
            }
            case 'story': {
                const image = item.image_versions2.candidates.toSorted((a, b) => b.width - a.width)[0];
                description = item.media_type === 2 ? renderVideo({ summary, image: image.url, video: item.video_versions[0] }) : renderImages({ summary, images: [{ ...image, alt: item.accessibility_caption }] });
                break;
            }
            default:
                throw new Error(`Instagram: Unhandled feed type: ${productType}`);
        }

        const music = item.story_music_stickers?.[0]?.music_asset_info ?? item.clips_metadata?.music_info?.music_asset_info;
        if (music?.title || music?.display_artist) {
            const name = [music.title, music.display_artist].filter(Boolean).join(' - ');
            description += `<p>🎵 ${music.audio_cluster_id ? `<a href="https://www.instagram.com/reels/audio/${music.audio_cluster_id}/">${name}</a>` : name}</p>`;
        }

        // Metadata
        const url = productType === 'story' ? `https://www.instagram.com/stories/${item.user.username}/${item.pk}/` : `https://www.instagram.com/p/${item.code}/`;
        const pubDate = parseDate(item.caption?.created_at_utc || item.taken_at, 'X');
        const title = summary.split('\n', 1)[0] || item.accessibility_caption || `Story from @${item.user.username}`;

        return {
            title,
            id: item.pk,
            pubDate,
            author: item.user.username,
            link: url,
            summary,
            description,
        };
    });
