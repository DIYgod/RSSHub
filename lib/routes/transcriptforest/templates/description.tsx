import { renderToString } from 'hono/jsx/dom/server';

type AudioData = {
    src?: string;
    type?: string;
};

type TextData = {
    startTime?: string;
    endTime?: string;
    text?: string;
};

type DescriptionData = {
    audios?: AudioData[];
    texts?: TextData[];
};

const TranscriptForestDescription = ({ audios, texts }: DescriptionData) => (
    <>
        {audios?.map((audio) =>
            audio?.src ? (
                <audio controls>
                    <source src={audio.src} type={audio.type} />
                    <object data={audio.src}>
                        <embed src={audio.src} />
                    </object>
                </audio>
            ) : null
        )}
        {texts?.map((text) => (
            <>
                {text.startTime && text.endTime ? (
                    <small>
                        {text.startTime} - {text.endTime}
                    </small>
                ) : null}
                <p>{text.text}</p>
            </>
        ))}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<TranscriptForestDescription {...data} />);
