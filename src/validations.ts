import moment from "moment";

import { Value, ErrorValue } from "./types";

export function validateIsRequired(value: Value, message = "Required."): boolean | string {
    if (value === null || value === false || value === "" || value === 0) {
        return message;
    } else {
        return false;
    }
}

export function validateInt(value: null | number, message = "The number has to be integer."): ErrorValue<number> {
    if (!Number.isInteger(value)) {
        return message;
    } else {
        return false;
    }
}

export function validateMin(value: null | number, min: number, message?: string): ErrorValue<number> {
    if (value === null || value < min) {
        if (message) {
            return message;
        } else {
            return `Value has to be minimum ${min}.`;
        }
    } else {
        return false;
    }
}

export function validateMax(value: null | number, max: number, message?: string): ErrorValue<number> {
    if (value === null || value > max) {
        if (message) {
            return message;
        } else {
            return `Value has to be maximum ${max}.`;
        }
    } else {
        return false;
    }
}

export function validateDate(value: null | Date, message = "The date in not valid."): ErrorValue<Date> {
    if (value === null || isNaN(value.getTime())) {
        return message;
    } else {
        return false;
    }
}

export function validateDateString(
    value: null | string, format: string, message = "Date is not in right format.",
): ErrorValue<Date> {
    if (!moment(value, format, true).isValid()) {
        return message;
    } else {
        return false;
    }
}

// source of regex http://emailregex.com/
// eslint-disable-next-line max-len
const mailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g;
export function validateMail(value: null | string, message = "Not valid e-mail."): ErrorValue<string> {
    mailRegex.lastIndex = 0;
    if (value === null || !mailRegex.test(value)) {
        return message;
    } else {
        return false;
    }
}
