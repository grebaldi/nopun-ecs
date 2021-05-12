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
);



export const Index: React.FC = () => (
    <div className="flex flex-col p-8 max-w-7xl mx-auto gap-16">
        <h1
            className="text-6xl text-center"
        >
            nopun-ecs
        </h1>

        <p className="text-center">
            An Entity-Component-System implementation in Typescript with no pun in its package name
        </p>

        <h2
            className="text-4xl text-center"
        >
            Demos
        </h2>

        <div className="grid grid-cols-2 gap-8 text-center">
            <article className="space-y-4">
                <a href={`${publicFolder}examples/basic/index.html`} className="block space-y-4">
                    <img
                        className="block"
                        src={`${publicFolder}examples/basic/screenshot.png`}
                        alt="Screenshot of Basic Example"
                    />
                    <span className="block text-xl font-semibold">
                        Basic
                    </span>
                </a>
                <p>
                    A very basic example that demonstrates how to create a moving object using
                    {' '}<XL href="https://github.com/grebaldi/nopun-ecs">nopun-ecs</XL> and the DOM.
                </p>
            </article>
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

        <section className="space-y-6 max-w-2xl mx-auto">
            <header>
                <h2 className="text-4xl text-center">Background</h2>
            </header>

            <h3 className="text-2xl">What is ECS?</h3>

            <p>
                ECS is short for Entity-Component-System, which is a popular, modern architectural pattern used
                {' '}in game development. At its core ECS is an object-oriented pattern, but it strongly favors
                {' '}composition over inheritance and separation of data from logic.
            </p>

            <p>
                A <strong className="font-bold">component</strong> is a simple data container. It can represent simple concepts like a position in 2D
                {' '}space, the player's health or something more complex like an RPG inventory. The important thing
                {' '}is, that it just holds data. ECS components are also not to be confused with React components
                {' '}or web components - the terms are radically different from each other.
            </p>

            An entity is a distinct object in a game. This could be a character, an obstacle, a platform, a bullet - you name it. The entity is a container for a set of components. A character entity for example might consist of a position component, a sprite component and a velocity component. Entities are only references, they do not hold any data of their own.

            A system manipulates component data by querying for entities based on their components. Example: A system might query for anything that has a position component and a velocity component and then updates the position based on the velocity. The system is completely indifferent as to what the specific entities represent, it only cares for the components involved.

            With these concepts ECS allows for very efficient code reuse, because behaviors are not bound to specific classes, but emerge from a combination of atomic components and systems. This not only makes it easier to introduce new ideas to an existing game, but also to share code across multiple projects.

            nopun-ecs also introduces the concept of scenes on top of the ECS vocabulary. Scenes define a context boundary within which entities and systems exist (other ECS implementations might call this world). Multiple scenes can be stitched together to form a tree structure, which allows for complexer game designs.

            For more on the awesome ECS architecture, checkout the following article: https://medium.com/ingeniouslysimple/entities-components-and-systems-89c31464240d
        </section>
    </div>
);

export default Index;