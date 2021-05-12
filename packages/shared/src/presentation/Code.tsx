import * as React from 'react';
import cx from 'classnames';
import Highlight, { defaultProps, Language } from "prism-react-renderer";
import vsDark from 'prism-react-renderer/themes/vsDark';

export const Code: React.FC<{
    className: string
    children: string
}> = props => {
    const language = props.className.replace(/language-/, '') as Language;


    return (
        <Highlight
            {...defaultProps}
            theme={vsDark}
            code={props.children.trimEnd()}
            language={language}
        >
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre className={cx(className, 'p-2')} style={style}>
                    {tokens.map((line, i) => (
                        <div {...getLineProps({ line, key: i })}>
                            {line.map((token, key) => (
                                <span {...getTokenProps({ token, key })}/>
                            ))}
                        </div>
                    ))}
                </pre>
            )}
        </Highlight>
    );
}
