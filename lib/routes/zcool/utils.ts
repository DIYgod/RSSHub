import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { art } from '@/utils/render';
import path from 'node:path';

const extractArticle = (data) => data.props.pageProps.data.summary + data.props.pageProps.data.memo;

const extractWork = (data) =>
    art(path.join(__dirname, 'templates/work.art'), {
        data: data.props.pageProps.data,
    });

export { extractArticle, extractWork };
