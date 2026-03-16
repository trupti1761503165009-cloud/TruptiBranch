import * as React from 'react';
require("./loader.css");

type Props = {};

export const Loader = React.memo((props: Props) => {
    return (
        <div className="lds-hourglass" />
    );
});
