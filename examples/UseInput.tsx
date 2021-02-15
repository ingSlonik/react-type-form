import { render } from "react-dom";
import React from "react";

import "../src/styles.scss";

import { useInput } from "../src";

function UseInputExample() {
    const { Input, value, error, setValue, setError } = useInput("Filip" as string);

    return <div>
        <Input label="Solo input" />

        <label>Value</label>
        <button onClick={() => setValue("Some value...")}>Set value</button>
        <div><b>{value}</b></div>

        <label>Error</label>
        <button onClick={() => setError("Some error.")}>Set error</button>
        <div><b>{error}</b></div>
    </div>;
}

render(<UseInputExample />, document.body);
