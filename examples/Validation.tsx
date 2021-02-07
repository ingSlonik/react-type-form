import { render } from "react-dom";
import React from "react";

import "../src/styles.scss";

import { Form, validateIsRequired, validateMax, validateMin } from "../src";

function ValidationExample() {
    return (
        <Form
            initialValues={{
                name: "",
                mail: "",
                age: 25,
                date: new Date(),
                equipment: [ "Bread" ],
                confirm: false as boolean,
            }}
            onValidate={async values => {
                if (values.name === "Name" && values.age < 30)
                    return "Especially you cannot pass.";

                return {
                    age: values.name === "Jane" ? validateMax(values.age, 50, "Jane you are too old.") : true,
                };
            }}
            onSubmit={async values => {
                if (values.confirm === false) {
                    return "You have to confirm";
                } else {
                    // await send form...
                    return "Sent";
                }
            }}
        >
            {({ Input, values, message, isChanged, isValid, onSubmit }) => (
                <>
                    <Input.Name onValidate={async name => {
                        if (name && name.length === 4) {
                            return true;
                        } else {
                            return "I accept only 4 letters names.";
                        }
                    }} />
                    <Input.Mail type="mail" />
                    <Input.Age min={18} onValidate={async value => validateMin(value, 20, "Still too jung.")} />
                    <Input.Date />
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

                    <button disabled={!isValid} onClick={onSubmit}>Send</button>

                    <pre>{JSON.stringify({ values, isValid, message, isChanged }, null, 4)}</pre>
                </>
            )}
        </Form>
    );
}

render(<ValidationExample />, document.body);
