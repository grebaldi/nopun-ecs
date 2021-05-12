const path = require('path');
const {getPackagesSync} = require("@lerna/project");

const withPlugins = require('next-compose-plugins');

const withMDX = require('@next/mdx')({
    extension: /\.mdx$/
});

const withTM = require('next-transpile-modules')(
    getPackagesSync(path.join(__dirname, '..'))
        .map(package => package.name)
        .filter(name => name !== require('./package.json').name)
);

const isDev = process.env.NODE_ENV === 'development';

module.exports = withPlugins([withMDX, withTM], {
    assetPrefix: isDev ? undefined : '/nopun-ecs/',
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
    publicRuntimeConfig: {
        publicFolder: isDev ? '/' : '/nopun-ecs/'
    }
});