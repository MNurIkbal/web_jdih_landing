// "use client";

// import Select, {
//   SingleValue,
//   StylesConfig,
// } from "react-select";
// import {
//   Control,
//   Controller,
//   FieldPath,
//   FieldValues,
// } from "react-hook-form";

// export type Select2Option = {
//   value: string | number;
//   label: string;
// };

// interface FormSelect2Props<
//   TFieldValues extends FieldValues
// > {
//   name: FieldPath<TFieldValues>;

//   control: Control<TFieldValues>;

//   label?: string;

//   placeholder?: string;

//   options: Select2Option[];

//   required?: boolean;

//   disabled?: boolean;

//   loading?: boolean;

//   error?: string;

//   isClearable?: boolean;

//   isSearchable?: boolean;

//   noOptionsMessage?: string;

//   searchPlaceholder?: string;
// }

// export default function FormSelect2<
//   TFieldValues extends FieldValues
// >({
//   name,
//   control,
//   label,
//   placeholder = "Pilih...",
//   options,
//   required = false,
//   disabled = false,
//   loading = false,
//   error,
//   isClearable = true,
//   isSearchable = true,
//   noOptionsMessage = "Data tidak ditemukan",
// }: FormSelect2Props<TFieldValues>) {

//   const customStyles: StylesConfig<Select2Option, false> = {
//     control: (
//       base,
//       state
//     ) => ({
//       ...base,

//       minHeight: "42px",

//       borderRadius: "10px",

//       borderColor: error
//         ? "#ef4444"
//         : state.isFocused
//         ? "#2563eb"
//         : "#e5e7eb",

//       boxShadow: state.isFocused
//         ? error
//           ? "0 0 0 3px rgba(239,68,68,0.10)"
//           : "0 0 0 3px rgba(37,99,235,0.10)"
//         : "none",

//       "&:hover": {
//         borderColor: error
//           ? "#ef4444"
//           : "#93c5fd",
//       },

//       backgroundColor:
//         disabled
//           ? "#f9fafb"
//           : "white",

//       transition:
//         "all 0.2s ease",

//       cursor:
//         disabled
//           ? "not-allowed"
//           : "default",
//     }),

//     valueContainer: (
//       base
//     ) => ({
//       ...base,

//       padding:
//         "4px 12px",
//     }),

//     placeholder: (
//       base
//     ) => ({
//       ...base,

//       color: "#9ca3af",

//       fontSize:
//         "0.875rem",
//     }),

//     singleValue: (
//       base
//     ) => ({
//       ...base,

//       color: "#111827",

//       fontSize:
//         "0.875rem",

//       fontWeight: 500,
//     }),

//     input: (
//       base
//     ) => ({
//       ...base,

//       color: "#111827",

//       fontSize:
//         "0.875rem",
//     }),

//     menu: (
//       base
//     ) => ({
//       ...base,

//       marginTop: "6px",

//       borderRadius: "12px",

//       overflow: "hidden",

//       border:
//         "1px solid #e5e7eb",

//       boxShadow:
//         "0 10px 30px rgba(0,0,0,0.10)",

//       zIndex: 9999,
//     }),

//     menuList: (
//       base
//     ) => ({
//       ...base,

//       padding: "6px",
//     }),

//     option: (
//       base,
//       state
//     ) => ({
//       ...base,

//       borderRadius:
//         "8px",

//       padding:
//         "10px 12px",

//       fontSize:
//         "0.875rem",

//       cursor:
//         "pointer",

//       backgroundColor:
//         state.isSelected
//           ? "#2563eb"
//           : state.isFocused
//           ? "#eff6ff"
//           : "white",

//       color:
//         state.isSelected
//           ? "white"
//           : "#374151",

//       fontWeight:
//         state.isSelected
//           ? 500
//           : 400,

//       transition:
//         "all 0.15s ease",
//     }),

//     dropdownIndicator: (
//       base,
//       state
//     ) => ({
//       ...base,

//       color:
//         state.isFocused
//           ? "#2563eb"
//           : "#9ca3af",

//       transition:
//         "transform 0.2s ease",

//       transform:
//         state.selectProps.menuIsOpen
//           ? "rotate(180deg)"
//           : "rotate(0deg)",

//       "&:hover": {
//         color: "#2563eb",
//       },
//     }),

//     clearIndicator: (
//       base
//     ) => ({
//       ...base,

//       color: "#9ca3af",

//       "&:hover": {
//         color: "#ef4444",
//       },
//     }),

//     indicatorSeparator: (
//       base
//     ) => ({
//       ...base,

//       backgroundColor:
//         "#e5e7eb",
//     }),

//     loadingIndicator: (
//       base
//     ) => ({
//       ...base,

//       color: "#2563eb",
//     }),

//     noOptionsMessage: (
//       base
//     ) => ({
//       ...base,

//       color: "#9ca3af",

//       fontSize:
//         "0.875rem",

//       padding:
//         "12px",
//     }),
//   };

//   return (
//     <Controller
//       name={name}
//       control={control}
//       render={({
//         field,
//       }) => {

//         const selectedOption =
//           options.find(
//             (option) =>
//               String(
//                 option.value
//               ) ===
//               String(
//                 field.value
//               )
//           ) ?? null;

//         return (
//           <div className="space-y-1.5">

//             {label && (
//               <label
//                 className="
//                   block
//                   text-sm
//                   font-medium
//                   text-gray-700
//                 "
//               >
//                 {label}

//                 {required && (
//                   <span className="ml-1 text-red-500">
//                     *
//                   </span>
//                 )}
//               </label>
//             )}

//             <Select
//               options={options}

//               value={
//                 selectedOption
//               }

//               onChange={(
//                 option: SingleValue<Select2Option>
//               ) => {
//                 field.onChange(
//                   option?.value ?? ""
//                 );
//               }}

//               onBlur={
//                 field.onBlur
//               }

//               placeholder={
//                 placeholder
//               }

//               isDisabled={
//                 disabled
//               }

//               isLoading={
//                 loading
//               }

//               isClearable={
//                 isClearable
//               }

//               isSearchable={
//                 isSearchable
//               }

//               noOptionsMessage={() =>
//                 noOptionsMessage
//               }

//               styles={
//                 customStyles
//               }

//               classNamePrefix="select2"

//               menuPlacement="auto"

//               menuPosition="absolute"

//               closeMenuOnSelect
//             />

//             {error && (
//               <p
//                 className="
//                   flex
//                   items-center
//                   gap-1
//                   text-xs
//                   text-red-500
//                 "
//               >
//                 <span>
//                   {error}
//                 </span>
//               </p>
//             )}

//           </div>
//         );
//       }}
//     />
//   );
// }


"use client";

import Select, {
  SingleValue,
  StylesConfig,
} from "react-select";

import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
} from "react-hook-form";

export type Select2Option = {
  value: string | number;
  label: string;
};

interface FormSelect2Props<
  TFieldValues extends FieldValues
> {
  name: FieldPath<TFieldValues>;

  control: Control<TFieldValues>;

  label?: string;

  placeholder?: string;

  options: Select2Option[];

  required?: boolean;

  disabled?: boolean;

  loading?: boolean;

  error?: string;

  isClearable?: boolean;

  isSearchable?: boolean;

  noOptionsMessage?: string;

  searchPlaceholder?: string;
}

export default function FormSelect2<
  TFieldValues extends FieldValues
>({
  name,
  control,
  label,
  placeholder = "Pilih...",
  options,
  required = false,
  disabled = false,
  loading = false,
  error,
  isClearable = true,
  isSearchable = true,
  noOptionsMessage = "Data tidak ditemukan",
}: FormSelect2Props<TFieldValues>) {

  /**
   * ============================================================
   * REACT SELECT INSTANCE ID
   * ============================================================
   *
   * react-select membuat ID internal seperti:
   *
   * react-select-1-input
   * react-select-2-input
   *
   * Jika ID tersebut berbeda antara server dan client,
   * Next.js akan menghasilkan hydration mismatch.
   *
   * Gunakan ID berdasarkan `name` agar selalu deterministic.
   */
  const selectInstanceId = `form-select-${String(name)
    .replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  const customStyles: StylesConfig<
    Select2Option,
    false
  > = {
    control: (
      base,
      state
    ) => ({
      ...base,

      minHeight: "42px",

      borderRadius: "10px",

      borderColor: error
        ? "#ef4444"
        : state.isFocused
        ? "#2563eb"
        : "#e5e7eb",

      boxShadow: state.isFocused
        ? error
          ? "0 0 0 3px rgba(239,68,68,0.10)"
          : "0 0 0 3px rgba(37,99,235,0.10)"
        : "none",

      "&:hover": {
        borderColor: error
          ? "#ef4444"
          : "#93c5fd",
      },

      backgroundColor: disabled
        ? "#f9fafb"
        : "white",

      transition: "all 0.2s ease",

      cursor: disabled
        ? "not-allowed"
        : "default",
    }),

    valueContainer: (
      base
    ) => ({
      ...base,

      padding: "4px 12px",
    }),

    placeholder: (
      base
    ) => ({
      ...base,

      color: "#9ca3af",

      fontSize: "0.875rem",
    }),

    singleValue: (
      base
    ) => ({
      ...base,

      color: "#111827",

      fontSize: "0.875rem",

      fontWeight: 500,
    }),

    input: (
      base
    ) => ({
      ...base,

      color: "#111827",

      fontSize: "0.875rem",
    }),

    menu: (
      base
    ) => ({
      ...base,

      marginTop: "6px",

      borderRadius: "12px",

      overflow: "hidden",

      border: "1px solid #e5e7eb",

      boxShadow:
        "0 10px 30px rgba(0,0,0,0.10)",

      zIndex: 9999,
    }),

    menuList: (
      base
    ) => ({
      ...base,

      padding: "6px",
    }),

    option: (
      base,
      state
    ) => ({
      ...base,

      borderRadius: "8px",

      padding: "10px 12px",

      fontSize: "0.875rem",

      cursor: "pointer",

      backgroundColor:
        state.isSelected
          ? "#2563eb"
          : state.isFocused
          ? "#eff6ff"
          : "white",

      color:
        state.isSelected
          ? "white"
          : "#374151",

      fontWeight:
        state.isSelected
          ? 500
          : 400,

      transition:
        "all 0.15s ease",
    }),

    dropdownIndicator: (
      base,
      state
    ) => ({
      ...base,

      color:
        state.isFocused
          ? "#2563eb"
          : "#9ca3af",

      transition:
        "transform 0.2s ease",

      transform:
        state.selectProps.menuIsOpen
          ? "rotate(180deg)"
          : "rotate(0deg)",

      "&:hover": {
        color: "#2563eb",
      },
    }),

    clearIndicator: (
      base
    ) => ({
      ...base,

      color: "#9ca3af",

      "&:hover": {
        color: "#ef4444",
      },
    }),

    indicatorSeparator: (
      base
    ) => ({
      ...base,

      backgroundColor:
        "#e5e7eb",
    }),

    loadingIndicator: (
      base
    ) => ({
      ...base,

      color: "#2563eb",
    }),

    noOptionsMessage: (
      base
    ) => ({
      ...base,

      color: "#9ca3af",

      fontSize: "0.875rem",

      padding: "12px",
    }),
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {

        /**
         * Cari object option berdasarkan value
         */
        const selectedOption =
          options.find(
            (option) =>
              String(option.value) ===
              String(field.value)
          ) ?? null;

        return (
          <div className="space-y-1.5">

            {label && (
              <label
                htmlFor={selectInstanceId}
                className="
                  block
                  text-sm
                  font-medium
                  text-gray-700
                "
              >
                {label}

                {required && (
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                )}
              </label>
            )}

            <Select
              /**
               * ==================================================
               * PENTING UNTUK NEXT.JS SSR HYDRATION
               * ==================================================
               */
              instanceId={selectInstanceId}

              /**
               * ID input juga dibuat deterministic
               */
              inputId={selectInstanceId}

              options={options}

              value={selectedOption}

              onChange={(
                option: SingleValue<Select2Option>
              ) => {
                field.onChange(
                  option?.value ?? ""
                );
              }}

              onBlur={field.onBlur}

              placeholder={placeholder}

              isDisabled={disabled}

              isLoading={loading}

              isClearable={isClearable}

              isSearchable={isSearchable}

              noOptionsMessage={() =>
                noOptionsMessage
              }

              styles={customStyles}

              classNamePrefix="select2"

              menuPlacement="auto"

              menuPosition="absolute"

              closeMenuOnSelect

              /**
               * Accessibility
               */
              aria-invalid={
                error ? true : undefined
              }
            />

            {error && (
              <p
                className="
                  flex
                  items-center
                  gap-1
                  text-xs
                  text-red-500
                "
              >
                <span>
                  {error}
                </span>
              </p>
            )}

          </div>
        );
      }}
    />
  );
}
