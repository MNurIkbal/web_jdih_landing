// "use client";

// import dynamic from "next/dynamic";
// import { Controller } from "react-hook-form";

// import type {
//   Control,
//   FieldPath,
//   FieldValues,
// } from "react-hook-form";

// interface CKEditorFieldProps<T extends FieldValues> {
//   label?: string;
//   name: FieldPath<T>;
//   control: Control<T>;
//   error?: string;
//   required?: boolean;
//   disabled?: boolean;
//   placeholder?: string;
//   minHeight?: number;
// }

// const CKEditorClient = dynamic(
//   () => import("./FormCKEditorClient"),
//   {
//     ssr: false,

//     loading: () => (
//       <div
//         className="
//           flex
//           items-start
//           px-5
//           py-4
//           text-sm
//           text-slate-400
//         "
//         style={{
//           minHeight: 400,
//         }}
//       >
//         Memuat editor...
//       </div>
//     ),
//   },
// );

// export default function CKEditorField<
//   T extends FieldValues,
// >({
//   label,
//   name,
//   control,
//   error,
//   required = false,
//   disabled = false,
//   placeholder = "Masukkan konten...",
//   minHeight = 400,
// }: CKEditorFieldProps<T>) {
//   return (
//     <div className="space-y-2">
//       {label && (
//         <label
//           htmlFor={`ckeditor-${String(name)}`}
//           className="
//             block
//             text-sm
//             font-medium
//             text-slate-700
//           "
//         >
//           {label}

//           {required && (
//             <span className="ml-1 text-red-500">
//               *
//             </span>
//           )}
//         </label>
//       )}

//       <div
//         className={`
//           overflow-hidden
//           rounded-xl
//           border
//           bg-white
//           ${
//             error
//               ? "border-red-400"
//               : "border-slate-200"
//           }
//           ${
//             disabled
//               ? "pointer-events-none opacity-60"
//               : ""
//           }
//         `}
//       >
//         <Controller
//           name={name}
//           control={control}
//           render={({ field }) => (
//             <CKEditorClient
//               value={
//                 typeof field.value === "string"
//                   ? field.value
//                   : ""
//               }
//               onChange={field.onChange}
//               onBlur={field.onBlur}
//               disabled={disabled}
//               placeholder={placeholder}
//               minHeight={minHeight}
//             />
//           )}
//         />
//       </div>

//       {error && (
//         <p className="text-sm font-medium text-red-500">
//           {error}
//         </p>
//       )}
//     </div>
//   );
// }

"use client";

import dynamic from "next/dynamic";
import { Controller } from "react-hook-form";

import type {
  Control,
  FieldPath,
  FieldValues,
} from "react-hook-form";

interface CKEditorFieldProps<T extends FieldValues> {
  label?: string;
  name: FieldPath<T>;
  control: Control<T>;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  minHeight?: number;
}

const CKEditorClient = dynamic(
  () => import("./FormCKEditorClient"),
  {
    ssr: false,

    loading: () => (
      <div
        className="flex items-start px-5 py-4 text-sm text-slate-400"
        style={{
          minHeight: 400,
        }}
      >
        Memuat editor...
      </div>
    ),
  },
);

export default function CKEditorField<
  T extends FieldValues,
>({
  label,
  name,
  control,
  error,
  required = false,
  disabled = false,
  placeholder = "Masukkan konten...",
  minHeight = 400,
}: CKEditorFieldProps<T>) {
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={`ckeditor-${String(name)}`}
          className="block text-sm font-medium text-slate-700"
        >
          {label}

          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>
      )}

      <div
        className={`
          overflow-hidden
          rounded-xl
          border
          bg-white
          ${
            error
              ? "border-red-400"
              : "border-slate-200"
          }
          ${
            disabled
              ? "pointer-events-none opacity-60"
              : ""
          }
        `}
      >
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <CKEditorClient
              value={
                typeof field.value === "string"
                  ? field.value
                  : ""
              }
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={disabled}
              placeholder={placeholder}
              minHeight={minHeight}
            />
          )}
        />
      </div>

      {error && (
        <p className="text-sm font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
