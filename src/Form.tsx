import React from "react";
import isEqual from "lodash/isEqual";
import { useCallback, useEffect, useMemo, useState } from "react";

import { TypeFormContext } from "./context";
import { capitalize, getInput } from "./unsafe";

import { InputsObject, Value, ValueObject, ErrorObject, ErrorValue, ErrorArray } from "./types";

type FormChildren<T extends ValueObject, M> = {
    Input: InputsObject<T>,
    values: T,
    message: null | M,
    isValid: boolean,
    // similar as `dirty` from `formik`
    isChanged: boolean,
    onSubmit: () => void,
}

type FormProps<T extends ValueObject, M> = {
    initialValues: T,
    onValidate?: (values: T) => Promise<true | M | ErrorObject<T>>,
    onSubmit: (values: T) => Promise<null | M>,
    children: (formChildren: FormChildren<T, M>) => JSX.Element,
}

Form.defaultProps = {};

export function Form<T extends ValueObject, M = string>(
    { initialValues, children, onValidate, onSubmit }: FormProps<T, M>,
): JSX.Element {
    const [ { values, errors }, setState ] = useState<{ values: T, errors: ErrorObject<T> }>({
        values: initialValues,
        errors: { },
    });
    const [ message, setMessage ] = useState<null | M>(null);

    const isValid = getIsValidFromErrors(errors);
    const names = Object.keys(values);

    // set values with change initialValues
    useEffect(() => {
        setState({ values: initialValues, errors: { } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ JSON.stringify(initialValues) ]);

    // keep reference of input names
    const Input = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Input: any = {};
        names.forEach(name => Input[capitalize(name)] = getInput(name));
        return Input;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ JSON.stringify(names) ]);

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
        setState(state => ({ ...state, errors: { ...state.errors, [name]: error } }));
        setMessage(null);
    }, []);

    const onSubmitCallback = useCallback(async () => {
        const message = await onSubmit(values);
        setMessage(message);
    }, [ onSubmit, values ]);

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

function getIsValidFromErrors<T extends Value>(
    error: ErrorValue<T> | ErrorArray<T> | ErrorObject<ValueObject>,
): boolean {
    if (typeof error === "undefined" || error === true) {
        return true;
    } else if (typeof error === "string" || error === false) {
        return false;
    } else if (Array.isArray(error)) {
        for (const e of error) {
            if (!getIsValidFromErrors(e)) {
                return false;
            }
        }
    } else if (typeof error === "object" && error !== null) {
        const err = error as ErrorObject<ValueObject>;
        for (const key in err) {
            if (!getIsValidFromErrors(err[key])) {
                return false;
            }
        }
    }

    return true;
}
