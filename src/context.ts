import { createContext } from "react";
import { Value, ValueObject, ErrorValue } from "./types";

type TypeFormContextType = {
    values: ValueObject | Value[],
    setValue: (name: string, value: Value) => void,
    errors: ErrorValue<Value>,
    setError: (name: string, error: ErrorValue<Value>) => void,
};

export const TypeFormContext = createContext<TypeFormContextType>({
    values: {},
    setValue: () => undefined,
    errors: {},
    setError: () => undefined,
});
