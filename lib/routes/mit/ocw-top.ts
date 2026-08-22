import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/ocw-top',
    categories: ['university'],
    example: '/mit/ocw-top',
    name: 'OpenCourseWare Most visited courses of the month',
    maintainers: ['dwemerx'],
    handler,
};

async function handler(): Promise<Data> {
    const baseUrl = 'https://ocw.mit.edu';
    const link = `${baseUrl}/course-lists/most-popular-courses/`;

    const html = await ofetch(link);
    const data = JSON.parse(JSON.parse(html.match(/window\.courseListsData = JSON\.parse\((".*?")\)/)![1]));
    const courses = (Object.values(data)[0] as Array<Record<string, any>>).map((entry) => {
        const course = Object.values(entry)[0];
        return {
            title: `${course.primary_course_number} ${course.course_title}`,
            link: `${baseUrl}/${course.url_path}/`,
            description: `<img src="${course.course_image_metadata.file}" alt="${course.course_image_metadata.image_metadata['image-alt']}"><br>${course.course_description_html}`,
            author: course.instructors?.map((instructor) => ({ name: instructor.title })),
            category: [...new Set([...course.learning_resource_types, ...course.level, ...course.topics.flat()])],
        };
    });

    return {
        title: 'MIT OCW most popular courses of the month',
        link,
        description: 'The most visited courses on OCW over the past month',
        language: 'en-us',
        item: courses,
    };
}
