import * as React from 'react';

export const Card: React.FC<{
    href: string
    imageSrc: string
    imageAlt: string
    title: React.ReactElement
}> = props => (
    <article className="space-y-4 text-center">
        <a href={props.href} className="group block space-y-4">
            <img
                className="block transition-all transform group-hover:scale-105 group-hover:shadow-xl"
                src={props.imageSrc}
                alt={props.imageAlt}
            />
            <span className="block text-xl font-semibold">
                {props.title}
            </span>
        </a>
        {props.children}
    </article>
);
