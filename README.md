# Type-Form

Type safe react form.

> :warning: TThis is `alpha` version at this moment. For production use library as `formik`. However, I welcome you to try this library and leave the issues.

## Main motivation

- Type safe form.
  - No technical mistakes.
  - Full support of IDE intellisense.
- Less code.

I missed type connection between data and form.
This package is inspired by `formik`.

## Features / Roadmap

- [x] TypeForm API
- [x] Inputs
- [ ] Validation
- [ ] Custom inputs
- [ ] Full documentation
- [ ] v1.0.0
- [ ] React native

## Get started

### Install

```
$ npm install --save type-form
```

### Import

```jsx
import { TypeForm } from "type-form";
```

### Styles

> Optional

Include basic styles of `type-form` inputs.
It will not affect your styling.

```jsx
import "type-form/styles.css";
```

## Examples

In folder `examples`.

```
$ npm run example -- --entry ./examples/Inputs.tsx
```

```jsx
import { TypeForm } from "type-form";

function InputsExample() {
  return (
    <TypeForm
      initialValues={{
        name: "",
        age: 25,
        date: new Date(),
        equipment: ["Bread"],
        confirm: false,
      }}
      onSubmit={async (values) => {
        console.log({ values });
        return "Sent";
      }}
    >
      {({ Input, values, message, isChanged, onSubmit }) => (
        <>
          <Input.Name />
          <Input.Age min={18} />
          <Input.Date />
          <Input.Equipment>
            {({ Input, isFirst, onAdd, onRemove }) => (
              <>
                {isFirst && (
                  <button onClick={() => onAdd("NEW")}>Add equipment</button>
                )}
                <button onClick={onRemove}>Remove equipment</button>
                <Input label="Equipment" />
              </>
            )}
          </Input.Equipment>
          <Input.Confirm label="I agree with everything" />
          {message && <pre>{message}</pre>}
          <button onClick={onSubmit}>Send</button>
        </>
      )}
    </TypeForm>
  );
}
```

## Input types

All can be `nullable` or/and `select`.

### String

#### `text`

#### `mail`

#### `password`

#### `textarea`

### Number

#### `int`

#### `float`

### Boolean

#### `checkbox`

#### `switch`

### Date

#### `date`

#### `datetime`

### Array

### Object
