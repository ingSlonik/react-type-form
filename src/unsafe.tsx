/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

// These functions save to be written really carefully and cannot go to user

import { useCallback, useContext } from "react";
import { TypeFormContext } from "./context";

import {
    InputObject, InputArray, InputBoolean, InputDate, InputNull, InputNumber, InputSelect, InputString,
} from "./Inputs";

import { FormInputProps, Input, Value, ErrorValue } from "./types";

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

    const value = (values as any)[name] as T;
    const error = (errors as any)[name] as ErrorValue<T>;

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
