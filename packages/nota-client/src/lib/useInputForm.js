import React from "react";

const required = (value, type) => {
  if (type === "string") {
    return value ? [null] : ["required"];
  } else if (type === "integer") {
    return value === null ? ["required"] : [null];
  }

  return value ? [null] : ["required"];
};
const typeValidations = {
  string: value => {
    return [
      typeof value === "string" || value instanceof String ? null : "not string"
    ];
  },
  integer: value => {
    if (value === "") {
      return [null, null];
    }

    const parsed = parseFloat(value);
    return Number.isInteger(parsed) ? [null, parsed] : ["not integer"];
  }
};
const validator = function(type) {
  const validations = [typeValidations[type]];
  const addValidation = function(validation) {
    validations.push(validation);
  };
  const validate = async function(value) {
    const errors = [];
    let parsedValue = value;

    for (let i = 0; i < validations.length; i++) {
      const [error, newParsedValue = parsedValue] = await validations[i](
        parsedValue,
        type
      );
      parsedValue = newParsedValue;

      if (error) {
        errors.push(error);
        break;
      }
    }

    return errors;
  };

  return {
    _validate: validate,
    required: function() {
      addValidation(required);
      return this;
    },
    addValidation: function(validation) {
      addValidation(validation);
      return this;
    }
  };
};
export const string = () => validator("string");
export const integer = () => validator("integer");

/**
 * @param {(values: any) => void} saveTask
 * @param {any?} initialValues
 * @returns {[{values: any, isValid: boolean, touched: any, errors: any}, (evt: React.FormEvent) => void, () => void, () => void]}
 */
const useInputForm = function(saveTask, schema, initialValues = {}) {
  const [{ values, touched, errors }, setFormStatus] = React.useState({
    values: initialValues,
    touched: {},
    errors: {}
  });
  const valuesRef = React.useRef("");

  React.useEffect(() => {
    const newValues = JSON.stringify(initialValues);

    if (valuesRef.current !== newValues) {
      valuesRef.current = newValues;
      setFormStatus({
        values: initialValues,
        touched: {},
        errors: {}
      });
    }
  }, [valuesRef, initialValues]);

  const validate = async function(values) {
    const fields = Object.keys(schema);
    const formErrors = {};

    for (let i = 0; i < fields.length; i++) {
      const name = fields[i];

      const errors = await schema[name]._validate(values[name]);

      if (errors.length) {
        formErrors[name] = errors;
      }
    }

    return formErrors;
  };

  const handleChange = function(evt) {
    const newValues = { ...values, [evt.target.name]: evt.target.value };
    const newTouched = { ...touched, [evt.target.name]: true };

    setFormStatus({
      errors,
      values: newValues,
      touched: newTouched
    });

    handleChangeValidate(newValues, newTouched);
  };

  const handleChangeValidate = async function(newValues, newTouched) {
    const newErrors = await validate(newValues);

    setFormStatus({
      errors: newErrors,
      values: newValues,
      touched: newTouched
    });
  };

  const handleSubmit = async function() {
    const fields = Object.keys(schema);
    const newTouched = fields.reduce(
      (touched, field) => ({ ...touched, [field]: true }),
      {}
    );
    const newErrors = await validate(values);

    if (Object.keys(newErrors).length) {
      setFormStatus({
        errors: newErrors,
        values: values,
        touched: newTouched
      });
      return;
    }

    await saveTask(values);
  };

  const handleReset = function() {
    setFormStatus({
      values: initialValues,
      touched: {},
      errors: {}
    });
  };

  const isValid = true;

  return [
    { values, isValid, touched, errors },
    handleChange,
    handleSubmit,
    handleReset
  ];
};

export default useInputForm;
