import { art } from '@/utils/render';
import path from 'node:path';

const courseDesc = (picurl, desc) =>
    art(path.join(__dirname, 'templates/courseDesc.art'), {
        picurl,
        desc,
    });

export default { courseDesc };
