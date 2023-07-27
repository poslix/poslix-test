import React from 'react';
import ReactDOMServer from 'react-dom/server';

export function PrintComponent(component) {
    const content = ReactDOMServer.renderToString(component);

    const windowObject = window.open('', '_blank', 'height=135.65,width=194.3');

    windowObject.document.write(`
    ${content}
  `);

    windowObject.document.close();
    windowObject.focus();
    windowObject.print();
    windowObject.close();
}
