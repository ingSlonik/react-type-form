import { render } from "react-dom";
import React from "react";

import "../src/styles.scss";

import { TypeForm } from "../src";

function InputsExample() {
    return (
        <TypeForm
            initialValues={{
                name: "",
                age: 25,
                date: new Date(),
                car: "A1",
                equipment: [ "Bread" ],
                confirm: false,
            }}
            onSubmit={async values => {
                // await send form...
                return "Sent";
            }}
        >
            {({ Input, values, message, isChanged, onSubmit }) => (
                <>
                    <Input.Name />
                    <Input.Age min={18} />
                    <Input.Date />
                    <Input.Car.Select options={[
                        { value: "A1", text: "Škoda" },
                        { value: "A2", text: "WV" },
                        { value: "A3", text: "BMW" },
                    ]} />
                    <Input.Equipment>
                        {({ Input, isFirst, onAdd, onRemove }) => (
                            <>
                                {isFirst && <button onClick={() => onAdd("NEW")}>Add equipment</button>}
                                <button onClick={onRemove}>Remove equipment</button>
                                <Input label="Equipment" />
                            </>
                        )}
                    </Input.Equipment>
                    <Input.Confirm label="I agree with everything" />

                    {message && <pre>{message}</pre>}

                    <button onClick={onSubmit}>Send</button>

                    <pre>{JSON.stringify({ values, message, isChanged }, null, 4)}</pre>
                </>
            )}
        </TypeForm>
    );
}

render(<InputsExample />, document.body);
