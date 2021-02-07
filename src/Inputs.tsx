import React, { CSSProperties, Fragment, useCallback, useEffect, useMemo, useState } from "react";

import moment from "moment";
import isEqual from "lodash/isEqual";

import { TypeFormContext } from "./context";
import { capitalize, getInput } from "./unsafe";

import {
    validateDate, validateDateString, validateInt, validateIsRequired, validateMail, validateMax, validateMin,
} from "./validations";

import {
    FormInputProps, Input, InputObjectType, InputsObject, Value, ValueObject,
    ErrorValue, ErrorArray,
} from "./types";

type OnValidate<T extends Value> = (value: T | null) => Promise<ErrorValue<T>>;

type InputAllProps<T extends Value> = {
    label?: string,
    required?: boolean,
    readOnly?: boolean,
    notNullValue?: Value,
    style?: CSSProperties,
    onValidate?: OnValidate<T>,
};

const inputAllDefaultProps = {
    style: {},
    required: false,
    readOnly: false,
    notNullValue: null,
};


const labelFromNameRegExp = new RegExp("[A-Z][a-z]", "g");
function getLabelFromName(name: string): string {
    return name.split(labelFromNameRegExp)
        .map((word, i) => i === 0 ?
            word.charAt(0).toLocaleUpperCase() + word.substring(1) :
            word.charAt(0).toLocaleLowerCase() + word.substring(1),
        )
        .join(" ");
}

function Label({ label, name }: { label?: string, name: string }) {
    if (label === "") {
        return null;
    } else if (typeof label === "undefined") {
        return <label>{getLabelFromName(name)}</label>;
    } else {
        return <label>{label}</label>;
    }
}

type ValidationResult = [ isValid: boolean, message: null | string ];

function useValidation<T extends Value>(
    props: { value: T } & FormInputProps<T> & InputAllProps<T>,
    inputValidation?: OnValidate<T>,
): ValidationResult {
    const { value, required, error, setError, onValidate } = props;
    const [ result, setResult ] = useState<ValidationResult>([ true, null ]);

    useEffect(() => {
        const requiredValidation = validateIsRequired(value);
        let newResult: ValidationResult = [ true, null ];

        if (typeof error === "string") {
            newResult = [ false, error ];
        } else if (error === false) {
            newResult = [ false, null ];
        } else if (required === true && requiredValidation !== true) {
            newResult = [ false, typeof requiredValidation === "string" ? requiredValidation : null ];
        } else if (onValidate || inputValidation) {
            (async () => {
                if (onValidate) {
                    const onValidateError = await onValidate(value);
                    if (onValidateError === true) {
                        if (inputValidation) {
                            const inputValidationError = await inputValidation(value);
                            if (inputValidationError !== error)
                                setError(inputValidationError);
                        } else {
                            if (onValidateError !== error)
                                setError(onValidateError);
                        }
                    } else {
                        if (onValidateError !== error)
                            setError(onValidateError);
                    }
                }
            })();
        }

        if (newResult[0] !== result[0] || newResult[1] !== result[1]) {
            setResult(newResult);
        }
    }, [ value, result, required, error, onValidate, setError, inputValidation ]);

    return result;
}

export type InputStringProps = InputAllProps<string> & {
    type?: "text" | "textarea" | "mail" | "password",
    onEnter?: () => void,
}

InputString.defaultProps = {
    ...inputAllDefaultProps,
    type: "text",
};

export function InputString(props: FormInputProps<string> & InputStringProps): JSX.Element {
    const { value, setValue, readOnly, type, style, onEnter } = props;

    const validationString = useCallback(async (value: string) => {
        if (type === "mail") return validateMail(value);
        return true;
    }, [ type ]);

    const [ isValid, message ] = useValidation(props, validationString);

    return <div className={`type-form-input ${isValid ? "valid" : "not-valid"}`} style={style}>
        <Label {...props} />
        {type !== "textarea" && <input
            type={type}
            style={style}
            readOnly={readOnly || false}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyPress={e => {
                if (onEnter && e.key === "Enter")
                    onEnter();
            }}
        />}
        {type === "textarea" && <textarea
            style={style}
            readOnly={readOnly || false}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyPress={e => {
                if (onEnter && e.key === "Enter")
                    onEnter();
            }}
        />}
        {message && <div className="message">{message}</div>}
    </div>;
}

export type InputDateProps = InputAllProps<Date> & {
    formatRead?: string,
    formatWrite?: string,
};

InputDate.defaultProps = {
    ...inputAllDefaultProps,
    formatRead: "LLL",
    formatWrite: "D. M. YYYY HH:mm:ss",
};

export function InputDate(props: FormInputProps<Date> & InputDateProps): JSX.Element {
    const { value, setValue, label, style, readOnly, notNullValue, formatRead, formatWrite } = props;

    const validationDate = useCallback(async (value: Date) => validateDate(value), [ ]);

    const [ isValid, message ] = useValidation(props, validationDate);

    const [ valueString, setValueString ] = useState(moment(value).format(formatWrite));

    useEffect(() => setValueString(moment(value).format(formatWrite)), [ value, formatWrite ]);

    const isValidString = validateDateString(valueString, formatWrite || InputDate.defaultProps.formatWrite) === true;

    const labelWithDate = `${
        props.label || getLabelFromName(props.name)
    } (${isValidString ? moment(valueString, formatWrite).format(formatRead) : moment(value).format(formatRead)})`;

    return <div className={`type-form-input ${isValid && isValidString ? "valid" : "not-valid"}`} style={style}>
        <Label name={props.name} label={labelWithDate} />
        <div className="flex-row">
            {notNullValue !== null && <Checkbox
                label={label}
                name={props.name}
                value={false}
                onChange={() => setValue(null)}
            />}
            <input
                className="grow-1"
                type="text"
                style={style}
                readOnly={readOnly || false}
                value={valueString}
                onChange={e => setValueString(e.target.value)}
                onBlur={e => {
                    const date = moment(e.target.value, formatWrite, true);
                    if (date.isValid()) {
                        setValue(date.toDate());
                    } else {
                        // Set back default value
                        setValueString(moment(value).format(formatWrite));
                    }
                }}
            />
        </div>
        {message && <div className="message">{message}</div>}
    </div>;
}


export type InputNumberProps = InputAllProps<number> & {
    type?: "int" | "float",
    min?: number,
    max?: number,
}

InputNumber.defaultProps = {
    ...inputAllDefaultProps,
    type: "int",
};

export function InputNumber(props: FormInputProps<number> & InputNumberProps): JSX.Element {
    const { value, setValue, readOnly, type, style, min, max } = props;

    const validationNumber = useCallback(async (value: number) => {
        let error: ErrorValue<number> = true;
        if (type === "int") error = validateInt(value);
        if (typeof min === "number") error = validateMin(value, min);
        if (typeof max === "number") error = validateMax(value, max);
        return error;
    }, [ type, min, max ]);

    const [ isValid, message ] = useValidation(props, validationNumber);

    const [ stringValue, setStringValue ] = useState(String(value));

    const getValueFromString = useCallback((stringValue: string) => {
        let value = type === "int" ? parseInt(stringValue) : parseFloat(stringValue);

        switch (type) {
            case "int": value = parseInt(stringValue); break;
            case "float": value = parseFloat(stringValue); break;
            default: value = Number(stringValue);
        }

        if (isNaN(value)) value = 0;

        if (typeof min === "number" && value < min) value = min;
        if (typeof max === "number" && value > max) value = max;

        return value;
    }, [ type, min, max ]);

    useEffect(() => setStringValue(String(value)), [ value ]);

    const isValidString = stringValue === String(getValueFromString(stringValue));

    return <div className={`type-form-input ${isValid && isValidString ? "valid" : "not-valid"}`} style={style}>
        <Label {...props} />
        <input
            type={"number"}
            style={style}
            readOnly={readOnly || false}
            value={stringValue}
            onChange={e => {
                const stringValue = e.target.value;
                const value = getValueFromString(stringValue);
                if (stringValue === String(value)) {
                    // Written value is valid number
                    setStringValue(e.target.value);
                    setValue(value);
                } else {
                    // For a case "-" or "0."
                    setStringValue(e.target.value);
                }
            }}
            onBlur={(e) => {
                const value = getValueFromString(e.target.value);
                setStringValue(String(value));
                setValue(value);
            }}
        />
        {message && <div className="message">{message}</div>}
    </div>;
}

export type InputBooleanProps = InputAllProps<boolean> & {
}

InputBoolean.defaultProps = {
    ...inputAllDefaultProps,
};

export function InputBoolean(props: FormInputProps<boolean> & InputBooleanProps): JSX.Element {
    const { value, setValue, label, style } = props;

    const [ isValid, message ] = useValidation(props);

    return <div className={`type-form-input ${isValid ? "valid" : "not-valid"}`} style={style}>
        <div className="flex-row">
            <Checkbox label={label} name={props.name} value={value} onChange={setValue} />
        </div>
        {message && <div className="message">{message}</div>}
    </div>;
}

export type InputSelectProps<T extends Value> = InputAllProps<T> & {
    options: Array<{ value: T, text: string }>,
}

InputSelect.defaultProps = {
    ...inputAllDefaultProps,
};

export function InputSelect<T extends Value>(props: FormInputProps<T> & InputSelectProps<T>): JSX.Element {
    const { value, setValue, options, style } = props;

    const [ isValid, message ] = useValidation(props);

    return <div className={`type-form-input ${isValid ? "valid" : "not-valid"}`} style={style}>
        <Label {...props} />
        <div className="flex-row">
            <select
                value={String(options.reduce((i, o, index) => isEqual(o.value, value) ? index : i, -1))}
                onChange={e => {
                    const index = parseInt(e.target.value);
                    if (index > -1 && index < options.length)
                        setValue(options[index].value);
                }}
            >
                <option value={String(-1)} disabled>Vyber...</option>
                {options.map((option, index) => <option key={index} value={String(index)}>{option.text}</option>)}
            </select>
        </div>
        {message && <div className="message">{message}</div>}
    </div>;
}


type InputNullProps = InputAllProps<Value>;

export function InputNull(props: FormInputProps<Value> & InputNullProps): JSX.Element {
    const { style, value, setValue, notNullValue } = props;

    const [ isValid, message ] = useValidation(props);

    return <div className={`type-form-input ${isValid ? "valid" : "not-valid"}`} style={style}>
        <Label {...props} />
        <Checkbox
            label={"Použít"}
            name={props.name}
            value={value !== null}
            onChange={is => {
                const value = is ? notNullValue : null;
                setValue(typeof value === "undefined" ? null : value);
            }}
        />
        {message && <div className="message">{message}</div>}
    </div>;
}

function Checkbox(
    { value, label, name, onChange }: { value: boolean, name: string, label?: string, onChange: (v: boolean) => void },
): JSX.Element {
    return <div className="checkbox" onClick={() => onChange(!value)}>
        <input type="checkbox" checked={value} readOnly />
        <Label name={name} label={label} />
    </div>;
}

// -------------- Special inputs --------------

export type InputArrayItemChildren<T extends Value> = {
    Input: T extends ValueObject ? InputsObject<T> : Input<T>,
    item: T,
    index: number,
    isFirst: boolean,
    isLast: boolean,
    onAdd: (value: T) => void,
    onRemove: () => void,
}

export type InputArrayProps<T extends Value> = {
    children: (itemArrayChildren: InputArrayItemChildren<T>) => JSX.Element,
};

export function InputArray<T extends Value>(props: FormInputProps<T[]> & InputArrayProps<T>): JSX.Element {
    const { value: values, setValue: setValues, error, setError: setErrors } = props;

    const errors = useMemo(() => Array.isArray(error) ? error : [], [ error ]) as ErrorArray<T>;

    const valuesLength = values.length;
    const Inputs = useMemo(() => {
        return Array.from({ length: valuesLength }).map((_, i) => getInput(String(i)));
    }, [ valuesLength ]);

    const setValue = useCallback((index: string, value) => {
        setValues(values.map((v, i) => index === String(i) ? value : v));
    }, [ setValues, values ]);

    const setError = useCallback((index: string, error) => {
        // Errors can be undefined and doesn't need to have all indexes
        const newErrors = [ ...errors ];
        newErrors[parseInt(index)] = error;
        setErrors(newErrors as ErrorValue<T[]>);
    }, [ setErrors, errors ]);

    const onAdd = useCallback((value: T) => {
        setValues([ ...values, value ]);
    }, [ setValues, values ]);
    const onRemove = useCallback((value: T) => {
        setValues(values.filter(v => v !== value));
    }, [ setValues, values ]);

    return <TypeFormContext.Provider value={{ values, setValue, errors, setError }}>
        {values.map((item, index) => {
            const itemArrayChildren: Omit<InputArrayItemChildren<T>, "Input"> = {
                item,
                index,
                isFirst: index === 0,
                isLast: index === values.length - 1,
                onAdd,
                onRemove: () => onRemove(item),
            };

            if (isObjectValue(item)) {
                const Input = Inputs[index] as InputObjectType<ValueObject>;
                return <Input key={index}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {({ Input }) => props.children({ Input: Input as any, ...itemArrayChildren })}
                </Input>;
            } else {
                return <Fragment key={index}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {props.children({ Input: Inputs[index] as any, ...itemArrayChildren })}
                </Fragment>;
            }
        })}
    </TypeFormContext.Provider>;
}

function isObjectValue(value: Value): value is ValueObject {
    return typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

export type InputObjectProps<T extends ValueObject> = {
    children: (inputObjectChildren: {
        Input: InputsObject<T>,
        values: T,
    }) => JSX.Element,
}

export function InputObject<T extends ValueObject>(props: FormInputProps<T> & InputObjectProps<T>): JSX.Element {
    const { value: values, setValue: setValues, error: errors, setError: setErrors } = props;

    const names = Object.keys(values);

    // keep reference of input names
    const Input = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Input: any = {};
        names.forEach(name => Input[capitalize(name)] = getInput(name));
        return Input;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ JSON.stringify(names) ]);

    const setValue = useCallback((name, value) => {
        setValues({ ...values, [name]: value });
    }, [ setValues, values ]);
    const setError = useCallback((name, error) => {
        setErrors({ ...errors, [name]: error });
    }, [ setErrors, errors ]);

    return <TypeFormContext.Provider value={{ values, setValue, errors, setError }}>
        {props.children({ Input, values })}
    </TypeFormContext.Provider>;
}
