import { render } from "react-dom";
import React from "react";

import "../src/styles.scss";

import { Form } from "../src";

function InputsExample() {
    return (
        <Form
            initialValues={{
                name: "",
                age: 25,
                photo: {
                    url: "",
                },
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
                    <Input.Photo.File
                        renderValue={value => <img style={{ height: "150px" }} src={value.url} />}
                        onFiles={async files => {
                            return { url: await toBase64(files[0]) };
                        }}
                    />
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
        </Form>
    );
}

render(<InputsExample />, document.body);

function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = error => reject(error);
    });
}
