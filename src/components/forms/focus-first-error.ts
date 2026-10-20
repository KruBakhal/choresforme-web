import {
  get,
  type FieldErrors,
  type FieldValues,
  type Path,
  type UseFormSetFocus,
} from "react-hook-form";

/**
 * A `handleSubmit` error callback that focuses the first invalid field in
 * the order given (list the fields in DOM order). Use it with
 * `shouldFocusError: false`: RHF's own focus follows registration order,
 * which differs from DOM order as soon as one field registers in the form's
 * render and another inside a child (FormField render prop, Controller).
 */
export function focusFirstError<T extends FieldValues>(
  fieldsInDomOrder: readonly Path<T>[],
  setFocus: UseFormSetFocus<T>,
): (errors: FieldErrors<T>) => void {
  return (errors) => {
    const first = fieldsInDomOrder.find((name) => get(errors, name));
    if (first) setFocus(first);
  };
}
