const withMDX = require('@next/mdx')({
    extension: /\.mdx$/
})

module.exports = withMDX({
    assetPrefix: process.env.NODE_ENV === 'development' ? undefined : '/nopun-ecs/',
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx']
});