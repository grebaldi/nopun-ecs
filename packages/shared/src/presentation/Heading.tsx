import * as React from 'react';

export const H1: React.FC = props => (
    <h5
        className="text-6xl text-center font-mono"
        {...props}
    />
);

export const H2: React.FC = props => (
    <h1
        className="text-4xl text-center"
        {...props}
    />
);

export const H3: React.FC = props => (
    <h1
        className="text-2xl font-semibold mb-6"
        {...props}
    />
);