import { createContext } from "react";
import { Value, ValueObject } from "./types";

type TypeFormContextType = {
    values: ValueObject | Value[],
    setValue: (name: string, value: Value) => void,
};

export const TypeFormContext = createContext<TypeFormContextType>({
    values: {},
    setValue: () => undefined,
});
