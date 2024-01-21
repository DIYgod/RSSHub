import art from 'art-template';
import json from '@/views/json';
import rss3Ums from '@/views/rss3-ums';

// We may add more control over it later

export default {
    art,
    json, // This should be used by RSSHub middleware only.
    rss3Ums,
};
