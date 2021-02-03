import React from "react";
import isEqual from "lodash/isEqual";
import { useCallback, useEffect, useMemo, useState } from "react";

import { TypeFormContext } from "./context";
import { capitalize, getInput } from "./unsafe";

import { InputsObject, Value, ValueObject } from "./types";

type FormChildren<T extends ValueObject> = {
    Input: InputsObject<T>,
    values: T,
    message: null | string,
    // similar as `dirty` from `formik`
    isChanged: boolean,
    onSubmit: () => void,
}

type TypeFormProps<T extends ValueObject> = {
    initialValues: T,
    onSubmit: (values: T) => Promise<null | string>,
    children: (formChildren: FormChildren<T>) => JSX.Element,
}

TypeForm.defaultProps = {};

export function TypeForm<I extends ValueObject>({ initialValues, children, onSubmit }: TypeFormProps<I>): JSX.Element {
    const [ { values }, setState ] = useState<{ values: I }>({ values: initialValues });
    const [ message, setMessage ] = useState<null | string>(null);

    // set values with change initialValues
    useEffect(() => {
        setState({ values: initialValues });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ JSON.stringify(initialValues) ]);

    const names = Object.keys(values);

    // keep reference of input names
    const Input = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Input: any = {};
        names.forEach(name => Input[capitalize(name)] = getInput(name));
        return Input;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ JSON.stringify(names) ]);

    const setValue = useCallback((name: keyof I, value: Value) => {
        setState(state => ({ values: { ...state.values, [name]: value } }));
        setMessage(null);
    }, []);

    const onSubmitCallback = useCallback(async () => {
        const message = await onSubmit(values);
        setMessage(message);
    }, [ onSubmit, values ]);

    return <TypeFormContext.Provider value={{ values, setValue }}>
        {children({
            Input,
            values,
            message,
            isChanged: !isEqual(initialValues, values),
            onSubmit: onSubmitCallback,
        })}
    </TypeFormContext.Provider>;
}
