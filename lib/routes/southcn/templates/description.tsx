import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    thumb?: string;
    videoUrl: string;
};

const SouthcnDescription = ({ thumb, videoUrl }: DescriptionData) => <video controls src={videoUrl} poster={thumb} />;

export const renderDescription = (data: DescriptionData) => renderToString(<SouthcnDescription {...data} />);
