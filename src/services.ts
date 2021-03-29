import { useEffect, useState } from "react";

import isEqual from "lodash/isEqual";

import { validateIsRequired } from "./validations";
import {
    Value, ValueObject, ErrorObject, ErrorValue, ErrorArray, FormInputProps, OnValidate, InputAllProps,
} from "./types";

export function getIsValidFromErrors<T extends Value>(
    error: ErrorValue<T> | ErrorArray<T> | ErrorObject<ValueObject> | undefined,
): boolean {
    if (typeof error === "undefined" || error === false) {
        return true;
    } else if (typeof error === "string" || error === true) {
        return false;
    } else if (Array.isArray(error)) {
        for (const e of error) {
            if (!getIsValidFromErrors(e)) {
                return false;
            }
        }
    } else if (typeof error === "object") {
        const err = error as { [name: string]: ErrorValue<Value> };
        for (const key in err) {
            if (!getIsValidFromErrors(err[key])) {
                return false;
            }
        }
    }

    return true;
}


type ValidationResult = [ isValid: boolean, message: null | string ];

export function useValidation<T extends Value>(
    props: { value: T } & FormInputProps<T> & InputAllProps<T>,
    inputValidation?: OnValidate<T>,
): ValidationResult {
    const { value, required, error, setError, onValidate } = props;
    const [ result, setResult ] = useState<ValidationResult>([ true, null ]);

    useEffect(() => {
        const requiredValidation = validateIsRequired(value, typeof required === "string" ? required : undefined);
        let newResult: ValidationResult = [ true, null ];

        if (typeof error === "string") {
            newResult = [ false, error ];
        } else if (error === false) {
            newResult = [ false, null ];
        } else if (required && requiredValidation !== false) {
            newResult = [ false, typeof requiredValidation === "string" ? requiredValidation : null ];
        } else if (onValidate || inputValidation) {
            (async () => {
                const onValidateError = onValidate && await onValidate(value);
                const isOnValidateErrorValid = getIsValidFromErrors(onValidateError);

                if (!isOnValidateErrorValid) {
                    if (!isEqual(onValidateError, error))
                        setError(onValidateError);
                } else {
                    const inputValidationError = inputValidation && await inputValidation(value);
                    const isInputValidationErrorValid = getIsValidFromErrors(onValidateError);

                    if (!isInputValidationErrorValid) {
                        if (!isEqual(inputValidationError, error))
                            setError(inputValidationError);
                    } else {
                        if (!getIsValidFromErrors(error))
                            setError(undefined);
                    }
                }
            })();
        }

        if (!isEqual(newResult, result))
            setResult(newResult);
    }, [ value, result, required, error, onValidate, setError, inputValidation ]);

    return result;
}
