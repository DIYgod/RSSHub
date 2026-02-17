import { parseDate } from '@/utils/parse-date';

import { renderImages } from './templates/images';
import { renderVideo } from './templates/video';

const renderItems = (items) =>
    items.map((item) => {
        const productType = item.product_type; // carousel_container, feed, clips, igtv
        // Content
        const summary = item.caption?.text ?? '';

        let description = '';
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
            default:
                throw new Error(`Instagram: Unhandled feed type: ${productType}`);
        }

        // Metadata
        const url = `https://www.instagram.com/p/${item.code}/`;
        const pubDate = parseDate(item.caption?.created_at_utc || item.taken_at, 'X');
        const title = summary.split('\n')[0];

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

export { renderItems };
