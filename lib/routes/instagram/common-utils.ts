import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

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
                description = art(path.join(__dirname, 'templates/images.art'), {
                    summary,
                    images,
                });
                break;
            }
            case 'clips':
            case 'igtv':
                description = art(path.join(__dirname, 'templates/video.art'), {
                    summary,
                    image: item.image_versions2.candidates.toSorted((a, b) => b.width - a.width)[0],
                    video: item.video_versions[0],
                });
                break;
            case 'feed': {
                const images = [{ ...item.image_versions2.candidates.toSorted((a, b) => b.width - a.width)[0], alt: item.accessibility_caption }];
                description = art(path.join(__dirname, 'templates/images.art'), {
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
