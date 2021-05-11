const withMDX = require('@next/mdx')({
    extension: /\.mdx$/
});

const isDev = process.env.NODE_ENV === 'development';

module.exports = withMDX({
    assetPrefix: isDev ? undefined : '/nopun-ecs/',
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
    publicRuntimeConfig: {
        publicFolder: isDev ? '/' : '/nopun-ecs/'
    }
});