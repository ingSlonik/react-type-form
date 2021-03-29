import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";

import moment from "moment";
import isEqual from "lodash/isEqual";

import { useValidation } from "./services";
import { TypeFormContext } from "./context";
import { NAME_EMPTY, getInput, useExtendedInputObject } from "./unsafe";

import {
    validateDate, validateDateString, validateInt, validateMail, validateMax, validateMin,
} from "./validations";

import {
    FormInputProps, Input, InputObjectType, Value, ValueObject,
    ErrorValue, InputsObjectSelectable, InputAllProps, InputsObjectExtended,
} from "./types";

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

export type InputStringProps = InputAllProps<string> & {
    type?: "text" | "textarea" | "mail" | "password",
    placeholder?: string,
    onEnter?: () => void,
}

InputString.defaultProps = {
    ...inputAllDefaultProps,
    type: "text",
    placeholder: "",
};

export function InputString(props: FormInputProps<string> & InputStringProps): JSX.Element {
    const { placeholder, value, setValue, readOnly, type, style, onChange, onEnter } = props;

    const validationString = useCallback(async (value: string) => {
        if (type === "mail") return validateMail(value);
        return true;
    }, [ type ]);

    const [ isValid, message ] = useValidation(props, validationString);

    return <div className={`type-form-input ${isValid ? "valid" : "not-valid"}`} style={style}>
        <Label {...props} />
        {type !== "textarea" && <input
            placeholder={placeholder}
            type={type}
            style={style}
            readOnly={readOnly || false}
            value={value}
            onChange={e => {
                const value = e.target.value;
                setValue(value);
                onChange && onChange(value);
            }}
            onKeyPress={e => {
                if (onEnter && e.key === "Enter")
                    onEnter();
            }}
        />}
        {type === "textarea" && <textarea
            placeholder={placeholder}
            readOnly={readOnly || false}
            value={value}
            onChange={e => {
                const value = e.target.value;
                setValue(value);
                onChange && onChange(value);
            }}
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
    const { value, setValue, style, readOnly, notNullValue, formatRead, formatWrite, onChange } = props;

    const validationDate = useCallback(async (value: Date) => validateDate(value), [ ]);

    const [ isValid, message ] = useValidation(props, validationDate);

    const [ valueString, setValueString ] = useState(moment(value).format(formatWrite));

    useEffect(() => setValueString(moment(value).format(formatWrite)), [ value, formatWrite ]);

    const isValidString = validateDateString(valueString, formatWrite || InputDate.defaultProps.formatWrite) === false;

    const labelWithDate = `${
        props.label || getLabelFromName(props.name)
    } (${isValidString ? moment(valueString, formatWrite).format(formatRead) : moment(value).format(formatRead)})`;

    return <div className={`type-form-input ${isValid && isValidString ? "valid" : "not-valid"}`} style={style}>
        <Label name={props.name} label={labelWithDate} />
        <div className="flex-row">
            {notNullValue !== null && <Checkbox
                label={""}
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
                        onChange && onChange(date.toDate());
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
    placeholder?: string,
}

InputNumber.defaultProps = {
    ...inputAllDefaultProps,
    type: "int",
    placeholder: "",
};

export function InputNumber(props: FormInputProps<number> & InputNumberProps): JSX.Element {
    const { placeholder, value, setValue, readOnly, type, style, min, max, onChange } = props;

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
            placeholder={placeholder}
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
                    onChange && onChange(value);
                } else {
                    // For a case "-" or "0."
                    setStringValue(e.target.value);
                }
            }}
            onBlur={(e) => {
                const value = getValueFromString(e.target.value);
                setStringValue(String(value));
                setValue(value);
                onChange && onChange(value);
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
    const { value, setValue, label, style, onChange } = props;

    const [ isValid, message ] = useValidation(props);

    return <div className={`type-form-input ${isValid ? "valid" : "not-valid"}`} style={style}>
        <div className="flex-row">
            <Checkbox label={label} name={props.name} value={value} onChange={value => {
                setValue(value);
                onChange && onChange(value);
            }} />
        </div>
        {message && <div className="message">{message}</div>}
    </div>;
}


export type InputFileProps<T extends Value> = InputAllProps<T> & {
    accept?: string,
    multiple?: boolean,
    onFiles: (files: File[]) => Promise<T>,
    renderValue?: (value: T) => JSX.Element,
}

InputSelect.defaultProps = {
    ...inputAllDefaultProps,
    multiple: false,
};

export function InputFile<T extends Value>(props: FormInputProps<T> & InputFileProps<T>): JSX.Element {
    const { value, setValue, multiple, accept, style, readOnly, renderValue, onChange, onFiles } = props;

    const [ isValid, message ] = useValidation(props);

    return <div className={`type-form-input ${isValid ? "valid" : "not-valid"}`} style={style}>
        <Label {...props} />
        {renderValue && renderValue(value)}
        <input
            type={"file"}
            style={style}
            readOnly={readOnly || false}
            accept={accept}
            multiple={multiple}
            onChange={async e => {
                const fileList = e.target.files;
                if (fileList) {
                    const files = [];

                    for (let i = 0; i < fileList.length; i++) {
                        const file = fileList.item(i);
                        if (file) {
                            files.push(file);
                        }
                    }
                    if (files.length > 0) {
                        const value = await onFiles(files);
                        setValue(value);
                        onChange && onChange(value);
                    }
                }
            }}
        />
        {message && <div className="message">{message}</div>}
    </div>;
}


export type InputSelectProps<T extends Value> = InputAllProps<T> & {
    options: Array<{ value: T, text: string }>,
    placeholder?: string,
}

InputSelect.defaultProps = {
    ...inputAllDefaultProps,
    placeholder: "Select...",
};

export function InputSelect<T extends Value>(props: FormInputProps<T> & InputSelectProps<T>): JSX.Element {
    const { value, setValue, options, style, placeholder, onChange } = props;

    const [ isValid, message ] = useValidation(props);

    const indexValue = options.reduce((i, o, index) => isEqual(o.value, value) ? index : i, -1);

    return <div className={`type-form-input ${isValid ? "valid" : "not-valid"}`} style={style}>
        <Label {...props} />
        <div className="flex-row">
            <select
                value={String(indexValue)}
                onChange={e => {
                    const index = parseInt(e.target.value);
                    if (index > -1 && index < options.length) {
                        const value = options[index].value;
                        setValue(value);
                        onChange && onChange(value);
                    }
                }}
            >
                <option value={String(-1)} disabled>{placeholder}</option>
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
    Input: T extends ValueObject ? InputsObjectSelectable<T> : Input<T>,
    value: T,
    valueBefore: null | T,
    values: T[],
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const errors = useMemo(() => Array.isArray(error) ? error : [], [ JSON.stringify(error) ]) as ErrorValue<T>[];

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

    let valueBefore: null | T = null;

    return <TypeFormContext.Provider value={{ values, setValue, errors, setError }}>
        {values.map((item, index) => {
            const itemArrayChildren: Omit<InputArrayItemChildren<T>, "Input"> = {
                value: item,
                valueBefore,
                values,
                index,
                isFirst: index === 0,
                isLast: index === values.length - 1,
                onAdd,
                onRemove: () => onRemove(item),
            };

            valueBefore = item;

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
        Input: InputsObjectExtended<T>,
        values: T,
    }) => JSX.Element,
}

export function InputObject<T extends ValueObject>(props: FormInputProps<T> & InputObjectProps<T>): JSX.Element {
    const { value: values, setValue: setValues, error: errors, setError: setErrors } = props;

    const names = Object.keys(values);

    const Input = useExtendedInputObject<T>(names);

    const setValue = useCallback((name, value) => {
        if (name === NAME_EMPTY) {
            setValues(value);
        } else {
            setValues({ ...values, [name]: value });
        }
    }, [ setValues, values ]);
    const setError = useCallback((name, error) => {
        if (name === NAME_EMPTY) {
            setErrors(error);
        } else {
            // error can by boolean or string from Select option
            if (typeof errors === "object") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setErrors({ ...(errors as any), [name]: error });
            } else {
                setErrors({ [name]: error } as ErrorValue<T>);
            }
        }
    }, [ setErrors, errors ]);

    return <TypeFormContext.Provider value={{ values, setValue, errors, setError }}>
        {props.children({ Input, values })}
    </TypeFormContext.Provider>;
}
