import { renderToString } from 'hono/jsx/dom/server';

export const renderDescription = (videoInfo) =>
    renderToString(
        <>
            {videoInfo.image ? (
                <>
                    <img src={videoInfo.image} />
                    <br />
                </>
            ) : null}
            {videoInfo.dvdId ? (
                <>
                    <b>DVD ID:</b> {videoInfo.dvdId}
                    <br />
                </>
            ) : null}
            {videoInfo.contentId ? (
                <>
                    <b>Content ID:</b> {videoInfo.contentId}
                    <br />
                </>
            ) : null}
            {videoInfo.releaseDate ? (
                <>
                    <b>Release Date:</b> {videoInfo.releaseDate}
                    <br />
                </>
            ) : null}
            {videoInfo.duration ? (
                <>
                    <b>Duration:</b> {videoInfo.duration} mins
                    <br />
                </>
            ) : null}
            {videoInfo.director ? (
                <>
                    <b>Director:</b> {videoInfo.director} {videoInfo.jpDirector}
                    <br />
                </>
            ) : null}
            {videoInfo.studio ? (
                <>
                    <b>Studio:</b> {videoInfo.studio.name}
                    <br />
                </>
            ) : null}
            {videoInfo.categories?.length ? (
                <>
                    <b>Categories:</b>
                    {videoInfo.categories.map((category) => (
                        <> {category.name},</>
                    ))}
                    <br />
                </>
            ) : null}
            {videoInfo.casts?.length ? (
                <>
                    <b>Cast(s):</b>
                    {videoInfo.casts.map((cast) => (
                        <>
                            {' '}
                            {cast.name} {cast.jpName}
                        </>
                    ))}
                    <br />
                </>
            ) : null}
            {videoInfo.gallery?.length
                ? videoInfo.gallery.map((image) => (
                      <>
                          <img src={image} />
                          <br />
                      </>
                  ))
                : null}
        </>
    );
