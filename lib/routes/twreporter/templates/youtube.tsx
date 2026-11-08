import { renderYoutube } from '@/routes/youtube/utils';

type YoutubeProps = {
    video: string;
};

export const renderYouTube = ({ video }: YoutubeProps): string => renderYoutube(true, video, undefined, undefined);
