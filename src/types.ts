import {
    InputBooleanProps, InputDateProps, InputNumberProps, InputSelectProps, InputStringProps,
    InputArrayProps, InputObjectProps,
} from "./Inputs";


export type Value = null | boolean | number | string | Date | Array<Value> | ValueObject;
export type ValueObject = { [name: string]: Value };

export type Input<T extends Value> =
    T extends string | null ? InputStringType<T> :
    T extends number | null ? InputNumberType<T> :
    T extends boolean | null ? InputBooleanType<T> :
    T extends Date | null ? InputDateType<T> :
    T extends Value[] ? InputArrayType<T[number]> :
    T extends ValueObject ? InputObjectType<T> : "Unreachable";

interface InputSelectable<T extends Value, Props extends Record<string, unknown>> {
    (props: Props): JSX.Element;
    Select: InputSelectType<T>;
}

type InputSelectType<T extends Value> = (props: InputSelectProps<T>) => JSX.Element;

type InputStringType<T extends string | null> = InputSelectable<T, InputStringProps>;
type InputNumberType<T extends number | null> = InputSelectable<T, InputNumberProps>;
type InputBooleanType<T extends boolean | null> = InputSelectable<T, InputBooleanProps>;
type InputDateType<T extends Date | null> = InputSelectable<T, InputDateProps>
type InputArrayType<T extends Value> = InputSelectable<T, InputArrayProps<T>>;
export type InputObjectType<T extends ValueObject> = InputSelectable<T, InputObjectProps<T>>;

export type InputsObject<T extends ValueObject> = {
    [N in keyof T as Capitalize<string & N>]: Input<T[N]>
};

// Inputs

export type FormInputProps<T> = {
    name: string,
    value: T,
    setValue: (value: T | null) => void;
};
