// These functions save to be written and tested really carefully and cannot go to a user

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useCallback, useContext } from "react";
import { TypeFormContext } from "./context";

import {
    InputObject, InputArray, InputBoolean, InputDate, InputNull, InputNumber, InputSelect, InputString,
} from "./Inputs";

import {
    FormInputProps, Input, InputsObject, InputsObjectSelectable, Value, ValueObject, ErrorValue,
} from "./types";

export const NAME_EMPTY = "_typeSafeFormEmptyNameForObjectInputSelect";

export function getInput<T extends Value>(name: string): Input<T> {
    const Input: any = (props: any) => <InputRouter
        inputType="input"
        name={name}
        {...props}
    />;
    // eslint-disable-next-line react/display-name
    Input.Select = (props: any) => <InputRouter
        inputType="select"
        name={name}
        {...props}
    />;

    // TODO: add custom

    return Input;
}

export function useInputsObject<T extends ValueObject>(names: string[]): InputsObject<T> {
    // keep reference of input names
    return useMemo(() => {
        const Input: any = {};
        names.forEach(name => Input[capitalize(name)] = getInput(name));
        return Input;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ JSON.stringify(names) ]);
}

export function useSelectableInputObject<T extends ValueObject>(names: string[]): InputsObjectSelectable<T> {
    // keep reference of input names
    return useMemo(() => {
        const Input: any = {};
        names.forEach(name => Input[capitalize(name)] = getInput(name));

        if (names.indexOf("select") === -1) {
            // eslint-disable-next-line react/display-name
            Input.Select = (props: any) => <InputRouter
                inputType="select"
                name={NAME_EMPTY}
                {...props}
            />;
        }

        return Input;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ JSON.stringify(names) ]);
}

function useFormField<T extends Value>(
    { name }: { name: string },
): { value: T, setValue: (value: T | null) => void, error: ErrorValue<T>, setError: (error: ErrorValue<T>) => void } {
    const { values, setValue, errors, setError } = useContext(TypeFormContext);

    const setValueWithoutName = useCallback(
        (value: T | null) => setValue(name, value),
        [ name, setValue ],
    );
    const setErrorWithoutName = useCallback(
        (error: ErrorValue<T>) => setError(name, error),
        [ name, setError ],
    );

    const value = name === NAME_EMPTY ? values as T : (values as any)[name] as T;
    const error = name === NAME_EMPTY ? errors : (errors as any)?.[name];

    return { value, setValue: setValueWithoutName, error, setError: setErrorWithoutName };
}

export type InputRouterProps<T extends Value, InputProps> = FormInputProps<T> & InputProps & {
    inputType: "input" | "select" | "custom"
}

export function InputRouter<T extends Value, InputProps>(
    { inputType, ...props }: InputRouterProps<T, InputProps>,
): JSX.Element {
    const formProps = useFormField<T>(props);
    const { value } = formProps;

    let Input: any;

    if (inputType === "select") {
        Input = InputSelect;
    } else if (inputType === "custom") {
        // TODO: next version
        throw new Error("Custom inputs are not implemented.");
    } else if (inputType === "input") {

        if (typeof value === "number") {
            Input = InputNumber;
        } else if (typeof value === "string") {
            Input = InputString;
        } else if (typeof value === "boolean") {
            Input = InputBoolean;
        } else if (value instanceof Date) {
            Input = InputDate;
        } else if (Array.isArray(value)) {
            Input = InputArray;
        } else if (value === null) {
            Input = InputNull;
        } else if (typeof value === "object") {
            Input = InputObject;
        } else {
            throw new Error("Unreachable");
        }
    } else {
        throw new Error("Unreachable");
    }

    return <Input {...props} {...formProps} />;
}

export function capitalize<T extends string>(name: T): Capitalize<T> {
    const capitalizedString: any = name.charAt(0).toUpperCase() + name.slice(1);
    return capitalizedString;
}
