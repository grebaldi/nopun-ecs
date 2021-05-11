const withMDX = require('@next/mdx')({
    extension: /\.mdx$/
})

module.exports = withMDX({
    assetPrefix: './',
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx']
});