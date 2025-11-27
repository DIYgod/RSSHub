import path from 'node:path';

import { art } from '@/utils/render';

const courseDesc = (picurl, desc) =>
    art(path.join(__dirname, 'templates/courseDesc.art'), {
        picurl,
        desc,
    });

export default { courseDesc };
