import getConfig from 'next/config';

const {publicRuntimeConfig: {publicFolder}} = getConfig();

const XL: React.FC<{
    href: string
}> = props => (
    <a
        className="text-blue-600"
        href={props.href}
        target="_blank"
        rel="nofollow noopener noreferrer"
    >
        {props.children}
    </a>
)

export const Index: React.FC = () => (
    <div className="flex flex-col p-8 text-center max-w-7xl mx-auto gap-8">
        <h1
            className="text-6xl"
        >
            nopun-ecs
        </h1>

        <p>
            An Entity-Component-System implementation in Typescript with no pun in its package name
        </p>

        <h2
            className="text-4xl"
        >
            Demos
        </h2>

        <div className="grid grid-cols-2 gap-8">
            <article className="space-y-4">
                <a href={`${publicFolder}examples/space-rock-eliminator-9000/index.html`} className="block space-y-4">
                    <img
                        className="block"
                        src={`${publicFolder}examples/space-rock-eliminator-9000/screenshot.png`}
                        alt="Screenshot of &quot;Ultimate Space Rock Eliminator 9000&quot;"
                    />
                    <span className="block text-xl font-semibold">
                        Ultimate Space Rock Eliminator 9000
                    </span>
                </a>
                <p>
                    A web based clone of <XL href="https://en.wikipedia.org/wiki/Asteroids_(video_game)">Asteroids (1979)</XL>
                    {' '}built with <XL href="https://www.pixijs.com/">pixi.js</XL>, <XL href="https://howlerjs.com/">howler.js</XL>
                    {' '}and <XL href="https://github.com/grebaldi/nopun-ecs">nopun-ecs</XL>
                </p>
            </article>
        </div>
    </div>
);

export default Index;