import 'tailwindcss/tailwind.css';
import {AppProps} from 'next/app';
import {MDXProvider} from '@mdx-js/react';

import {mdx} from '@nopun-ecs/gh-pages-shared';

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
    return (
        <MDXProvider components={mdx}>
            <div className="space-y-16">
                <Component
                    {...pageProps}
                />
            </div>
        </MDXProvider>
    );
};

export default MyApp