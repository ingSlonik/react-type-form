import React from "react";
import isEqual from "lodash/isEqual";
import { useCallback, useEffect, useState } from "react";

import { getIsValidFromErrors } from "./services";
import { TypeFormContext } from "./context";
import { useInputsObject } from "./unsafe";

import { InputsObject, Value, ValueObject, ErrorObject, ErrorValue } from "./types";

type Message = string;

type FormChildren<T extends ValueObject> = {
    Input: InputsObject<T>,
    values: T,
    message: null | Message,
    isValid: boolean,
    // similar as `dirty` from `formik`
    isChanged: boolean,
    onSubmit: () => void,
}

type FormProps<T extends ValueObject> = {
    initialValues: T,
    onValidate?: (values: T) => Promise<true | Message | ErrorObject<T>>,
    onSubmit: (values: T) => Promise<null | Message>,
    children: (formChildren: FormChildren<T>) => JSX.Element,
}

Form.defaultProps = {};

export function Form<T extends ValueObject>(
    { initialValues, children, onValidate, onSubmit }: FormProps<T>,
): JSX.Element {
    const [ { values, errors }, setState ] = useState<{ values: T, errors: ErrorObject<T> }>({
        values: initialValues,
        errors: { },
    });
    const [ message, setMessage ] = useState<null | Message>(null);

    const isValid = getIsValidFromErrors(errors);
    const names = Object.keys(values);

    // set values with change initialValues
    useEffect(() => {
        setState({ values: initialValues, errors: { } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ JSON.stringify(initialValues) ]);

    const Input = useInputsObject<T>(names);

    const setValue = useCallback(async (name: keyof T, value: Value) => {
        const newValues = { ...values, [name]: value };
        if (onValidate) {
            const validation = await onValidate(newValues);
            if (typeof validation === "string" || validation === true) {
                setState(state => ({ ...state, values: newValues }));
                setMessage(typeof validation === "string" ? validation : null);
            } else {
                setState(state => ({ ...state, errors: validation, values: newValues }));
                setMessage(null);
            }
        } else {
            setState(state => ({ ...state, values: newValues }));
            setMessage(null);
        }
    }, [ values, onValidate ]);

    const setError = useCallback((name: keyof T, error: ErrorValue<T[keyof T]>) => {
        setState(state => ({
            ...state,
            errors: { ...state.errors, [name]: error },
        }));
        setMessage(null);
    }, []);

    const onSubmitCallback = useCallback(async () => {
        if (onValidate) {
            const validation = await onValidate(values);
            if (validation !== true) {
                if (typeof validation === "string") {
                    setMessage(typeof validation === "string" ? validation : null);
                } else {
                    setState(state => ({ ...state, errors: validation }));
                }
                return;
            }
        }

        if (!isValid) {
            return;
        }

        const message = await onSubmit(values);
        setMessage(message);
    }, [ isValid, onSubmit, values, onValidate ]);

    return <TypeFormContext.Provider value={{ values, setValue, errors, setError }}>
        {children({
            Input,
            values,
            message,
            isValid,
            isChanged: !isEqual(initialValues, values),
            onSubmit: onSubmitCallback,
        })}
    </TypeFormContext.Provider>;
}
