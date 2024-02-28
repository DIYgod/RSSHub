import { art } from '@/utils/render';
import * as path from 'node:path';

const courseDesc = (picurl, desc) =>
    art(path.join(__dirname, 'templates/courseDesc.art'), {
        picurl,
        desc,
    });

module.exports = {
    courseDesc,
};
