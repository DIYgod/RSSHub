import { renderToString } from 'hono/jsx/dom/server';

interface TableCell {
    html: string;
    header: boolean;
}

export const renderQuestion = (question: string) => renderToString(<span>{question}</span>);

export const renderTable = (rows: TableCell[][]) =>
    renderToString(
        <table>
            <tbody>
                {rows.map((row) => (
                    <tr>
                        {row.map(({ html, header }) => {
                            const Cell = header ? 'th' : 'td';
                            return <Cell dangerouslySetInnerHTML={{ __html: html }} />;
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );

export const renderAudio = (src: string) =>
    renderToString(
        <>
            <audio src={src} controls preload="none" />
            <p>
                <a href={src}>Listen to the audio</a>
            </p>
        </>
    );

export const renderVideo = (src: string, poster?: string) =>
    renderToString(
        <>
            <video src={src} poster={poster} controls preload="none" />
            <p>
                <a href={src}>Watch the video</a>
            </p>
        </>
    );

export const renderEmbed = (src: string, link: string) =>
    renderToString(
        <>
            <iframe src={src} title="Video" width={640} height={360} allowFullscreen />
            <p>
                <a href={link}>Watch the video</a>
            </p>
        </>
    );
