import * as React from 'react';

export const Link: React.FC<{
    href: string
}> = props => {
    const isExternal = props.href.startsWith('http://') || props.href.startsWith('https://');

    return (
        <a
            className="text-blue-800"
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            {...props}
        />
    );
}
