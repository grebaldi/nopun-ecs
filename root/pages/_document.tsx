import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'
import cx from 'classnames';


class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx)
        return { ...initialProps }
    }

    render() {
        return (
            <Html>
                <Head>
                    <link rel="shortcut icon" href="/nopun-ecs/static/favicon.svg"/>
                </Head>
                <body
                    className="bg-gradient-to-b from-gray-300 to-gray-100"
                >
                    <a
                        className={cx(
                            'group fixed top-16 -right-16 z-10',
                            'p-1 w-full max-w-xs',
                            'transform rotate-45',
                            'bg-gray-900 text-gray-50',
                            'hover:bg-yellow-100 hover:text-gray-900 hover:ring hover:ring-yellow-500',
                            'transition-colors'
                        )}
                        href="https://github.com/grebaldi/nopun-ecs"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span
                            className={cx(
                                'flex pl-16 p-1 w-full',
                                'border border-gray-50',
                                'text-center',
                                'group-hover:border-gray-900'
                            )}
                        >
                            <svg width="24" height="24" fill="currentColor" className="mr-2"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.458.5.092.682-.216.682-.48 0-.236-.008-.864-.013-1.695-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.606 9.606 0 0112 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.028 1.587 1.028 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48C19.137 20.107 22 16.373 22 11.969 22 6.463 17.522 2 12 2z"></path></svg>
                            Fork me on github
                        </span>
                    </a>
                    <div className="flex flex-col p-8 max-w-7xl mx-auto gap-16">
                        <Main />
                    </div>
                    <footer className="text-center bg-gray-800 p-6 text-gray-100">
                            &copy; <a className="text-blue-200" target="_blank" rel="noreferrer noopener" href="https://github.com/grebaldi">Wilhelm Behncke</a> 2021
                    </footer>
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument
