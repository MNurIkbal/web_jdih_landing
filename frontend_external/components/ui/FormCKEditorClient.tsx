// "use client";

// import { CKEditor } from "@ckeditor/ckeditor5-react";

// import {
//   ClassicEditor,
//   Essentials,
//   Paragraph,
//   Heading,
//   Bold,
//   Italic,
//   Underline,
//   Strikethrough,
//   Font,
//   Alignment,
//   Link,
//   List,
//   Indent,
//   BlockQuote,
//   HorizontalLine,
//   Table,
//   TableToolbar,
//   RemoveFormat,
//   SpecialCharacters,
//   SpecialCharactersEssentials,
// } from "ckeditor5";

// import "ckeditor5/ckeditor5.css";

// interface Props {
//   value: string;
//   onChange: (value: string) => void;
//   onBlur?: () => void;
//   disabled?: boolean;
//   placeholder?: string;
//   minHeight?: number;
// }

// const editorConfig = {
//   licenseKey: "GPL",

//   plugins: [
//     Essentials,
//     Paragraph,
//     Heading,

//     Bold,
//     Italic,
//     Underline,
//     Strikethrough,
//     RemoveFormat,

//     Font,
//     Alignment,

//     List,
//     Indent,

//     Link,
//     BlockQuote,
//     HorizontalLine,

//     Table,
//     TableToolbar,

//     SpecialCharacters,
//     SpecialCharactersEssentials,
//   ],

//   toolbar: {
//     items: [
//       "undo",
//       "redo",
//       "|",
//       "heading",
//       "|",
//       "fontFamily",
//       "fontSize",
//       "|",
//       "bold",
//       "italic",
//       "underline",
//       "strikethrough",
//       "removeFormat",
//       "|",
//       "fontColor",
//       "fontBackgroundColor",
//       "|",
//       "alignment",
//       "|",
//       "bulletedList",
//       "numberedList",
//       "|",
//       "outdent",
//       "indent",
//       "|",
//       "link",
//       "insertTable",
//       "blockQuote",
//       "horizontalLine",
//       "|",
//       "specialCharacters",
//     ],

//     shouldNotGroupWhenFull: true,
//   },

//   heading: {
//     options: [
//       {
//         model: "paragraph",
//         title: "Paragraph",
//         class: "ck-heading_paragraph",
//       },
//       {
//         model: "heading1",
//         view: "h1",
//         title: "Heading 1",
//         class: "ck-heading_heading1",
//       },
//       {
//         model: "heading2",
//         view: "h2",
//         title: "Heading 2",
//         class: "ck-heading_heading2",
//       },
//       {
//         model: "heading3",
//         view: "h3",
//         title: "Heading 3",
//         class: "ck-heading_heading3",
//       },
//       {
//         model: "heading4",
//         view: "h4",
//         title: "Heading 4",
//         class: "ck-heading_heading4",
//       },
//     ],
//   },

//   fontFamily: {
//     options: [
//       "default",
//       "Arial",
//       "Calibri",
//       "Georgia",
//       "Tahoma",
//       "Times New Roman",
//       "Verdana",
//     ],

//     supportAllValues: true,
//   },

//   fontSize: {
//     options: [
//       10,
//       12,
//       14,
//       "default",
//       16,
//       18,
//       20,
//       24,
//       28,
//       32,
//     ],

//     supportAllValues: true,
//   },

//   alignment: {
//     options: [
//       "left",
//       "center",
//       "right",
//       "justify",
//     ] as const,
//   },

//   link: {
//     addTargetToExternalLinks: true,
//     defaultProtocol: "https://",
//   },

//   table: {
//     contentToolbar: [
//       "tableColumn",
//       "tableRow",
//       "mergeTableCells",
//     ],
//   },
// };

// export default function CKEditorClient({
//   value,
//   onChange,
//   onBlur,
//   disabled = false,
//   placeholder = "Masukkan konten...",
//   minHeight = 400,
// }: Props) {
//   return (
//     <div className="ckeditor-wrapper">
//       <CKEditor
//         editor={ClassicEditor}
//         disabled={disabled}
//         data={value || ""}
//         config={{
//           ...editorConfig,
//           placeholder,
//         }}
//         onChange={(_, editor) => {
//           onChange(editor.getData());
//         }}
//         onBlur={() => {
//           onBlur?.();
//         }}
//       />

//       <style jsx global>{`
//         .ckeditor-wrapper {
//           width: 100%;
//         }

//         .ckeditor-wrapper .ck.ck-editor {
//           width: 100%;
//         }

//         .ckeditor-wrapper .ck.ck-toolbar {
//           border: 0 !important;
//           border-bottom: 1px solid #e5e7eb !important;
//           background: #f8fafc !important;
//           padding: 8px !important;
//         }

//         .ckeditor-wrapper
//           .ck.ck-toolbar
//           .ck-toolbar__items {
//           gap: 2px;
//         }

//         .ckeditor-wrapper .ck.ck-button {
//           border-radius: 6px !important;
//         }

//         .ckeditor-wrapper .ck.ck-button:hover {
//           background: #eff6ff !important;
//         }

//         .ckeditor-wrapper .ck.ck-button.ck-on {
//           background: #dbeafe !important;
//           color: #2563eb !important;
//         }

//         .ckeditor-wrapper
//           .ck.ck-editor__main
//           > .ck-editor__editable {
//           border: 0 !important;
//         }

//         .ckeditor-wrapper
//           .ck.ck-editor__editable.ck-focused {
//           border: 0 !important;
//           box-shadow:
//             inset 0 0 0 1px #2563eb !important;
//         }

//         .ckeditor-wrapper
//           .ck-editor__editable_inline {
//           min-height: ${minHeight}px !important;
//           padding: 20px 24px !important;
//         }

//         .ckeditor-wrapper .ck-content {
//           min-height: ${minHeight}px;
//           font-size: 15px;
//           line-height: 1.8;
//           color: #374151;
//         }

//         .ckeditor-wrapper .ck-content h1 {
//           font-size: 2rem;
//           font-weight: 700;
//           margin: 1.5rem 0 1rem;
//         }

//         .ckeditor-wrapper .ck-content h2 {
//           font-size: 1.5rem;
//           font-weight: 700;
//           margin: 1.5rem 0 1rem;
//         }

//         .ckeditor-wrapper .ck-content h3 {
//           font-size: 1.25rem;
//           font-weight: 600;
//           margin: 1.25rem 0 0.75rem;
//         }

//         .ckeditor-wrapper .ck-content h4 {
//           font-size: 1.125rem;
//           font-weight: 600;
//           margin: 1rem 0 0.5rem;
//         }

//         .ckeditor-wrapper .ck-content p {
//           margin-bottom: 0.75rem;
//         }

//         .ckeditor-wrapper .ck-content blockquote {
//           border-left: 4px solid #2563eb;
//           padding-left: 1rem;
//           margin: 1rem 0;
//           color: #6b7280;
//         }

//         .ckeditor-wrapper .ck-content table {
//           width: 100%;
//         }

//         .ckeditor-wrapper .ck-content ul,
//         .ckeditor-wrapper .ck-content ol {
//           padding-left: 2rem;
//         }
//       `}</style>
//     </div>
//   );
// }


"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";

import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Heading,

  Bold,
  Italic,
  Underline,
  Strikethrough,
  Font,

  Alignment,
  Link,

  List,
  Indent,

  BlockQuote,
  HorizontalLine,

  Table,
  TableToolbar,

  RemoveFormat,

  SpecialCharacters,
  SpecialCharactersEssentials,

  // ==========================================
  // IMAGE
  // ==========================================
  Image,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageResize,
  ImageInsert,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  minHeight?: number;
}

const editorConfig = {
  licenseKey: "GPL",

  plugins: [
    Essentials,
    Paragraph,
    Heading,

    Bold,
    Italic,
    Underline,
    Strikethrough,
    RemoveFormat,

    Font,

    Alignment,

    List,
    Indent,

    Link,

    BlockQuote,
    HorizontalLine,

    Table,
    TableToolbar,

    SpecialCharacters,
    SpecialCharactersEssentials,

    // ==========================================
    // IMAGE PLUGINS
    // ==========================================
    Image,
    ImageToolbar,
    ImageCaption,
    ImageStyle,
    ImageResize,
    ImageInsert,
  ],

  toolbar: {
    items: [
      "undo",
      "redo",

      "|",

      "heading",

      "|",

      "fontFamily",
      "fontSize",

      "|",

      "bold",
      "italic",
      "underline",
      "strikethrough",
      "removeFormat",

      "|",

      "fontColor",
      "fontBackgroundColor",

      "|",

      "alignment",

      "|",

      "bulletedList",
      "numberedList",

      "|",

      "outdent",
      "indent",

      "|",

      "link",

      // ==========================================
      // INSERT IMAGE
      // ==========================================
      "insertImage",

      "insertTable",

      "blockQuote",
      "horizontalLine",

      "|",

      "specialCharacters",
    ],

    shouldNotGroupWhenFull: true,
  },

  // ==========================================
  // IMAGE CONFIGURATION
  // ==========================================

  image: {
    toolbar: [
      "imageStyle:inline",
      "imageStyle:block",
      "imageStyle:side",

      "|",

      "toggleImageCaption",
      "imageTextAlternative",

      "|",

      "resizeImage",
    ],

    styles: [
      "inline",
      "block",
      "side",
    ],

    resizeOptions: [
      {
        name: "resizeImage:original",
        value: null,
        label: "Original",
      },
      {
        name: "resizeImage:25",
        value: "25",
        label: "25%",
      },
      {
        name: "resizeImage:50",
        value: "50",
        label: "50%",
      },
      {
        name: "resizeImage:75",
        value: "75",
        label: "75%",
      },
    ],
  },

  // ==========================================
  // HEADING
  // ==========================================

  heading: {
    options: [
      {
        model: "paragraph",
        title: "Paragraph",
        class: "ck-heading_paragraph",
      },

      {
        model: "heading1",
        view: "h1",
        title: "Heading 1",
        class: "ck-heading_heading1",
      },

      {
        model: "heading2",
        view: "h2",
        title: "Heading 2",
        class: "ck-heading_heading2",
      },

      {
        model: "heading3",
        view: "h3",
        title: "Heading 3",
        class: "ck-heading_heading3",
      },

      {
        model: "heading4",
        view: "h4",
        title: "Heading 4",
        class: "ck-heading_heading4",
      },
    ],
  },

  // ==========================================
  // FONT
  // ==========================================

  fontFamily: {
    options: [
      "default",
      "Arial",
      "Calibri",
      "Georgia",
      "Tahoma",
      "Times New Roman",
      "Verdana",
    ],

    supportAllValues: true,
  },

  fontSize: {
    options: [
      10,
      12,
      14,
      "default",
      16,
      18,
      20,
      24,
      28,
      32,
    ],

    supportAllValues: true,
  },

  // ==========================================
  // ALIGNMENT
  // ==========================================

  alignment: {
    options: [
      "left",
      "center",
      "right",
      "justify",
    ] as const,
  },

  // ==========================================
  // LINK
  // ==========================================

  link: {
    addTargetToExternalLinks: true,
    defaultProtocol: "https://",
  },

  // ==========================================
  // TABLE
  // ==========================================

  table: {
    contentToolbar: [
      "tableColumn",
      "tableRow",
      "mergeTableCells",
    ],
  },
};

export default function CKEditorClient({
  value,
  onChange,
  onBlur,
  disabled = false,
  placeholder = "Masukkan konten...",
  minHeight = 400,
}: Props) {
  return (
    <div className="ckeditor-wrapper">
      <CKEditor
        editor={ClassicEditor}
        disabled={disabled}
        data={value || ""}
        config={{
          ...editorConfig,
          placeholder,
        }}
        onChange={(_, editor) => {
          onChange(editor.getData());
        }}
        onBlur={() => {
          onBlur?.();
        }}
      />

      <style jsx global>{`
        .ckeditor-wrapper {
          width: 100%;
        }

        .ckeditor-wrapper .ck.ck-editor {
          width: 100%;
        }

        /* ==========================================
           TOOLBAR
        ========================================== */

        .ckeditor-wrapper .ck.ck-toolbar {
          border: 0 !important;
          border-bottom: 1px solid #e5e7eb !important;
          background: #f8fafc !important;
          padding: 8px !important;
        }

        .ckeditor-wrapper
          .ck.ck-toolbar
          .ck-toolbar__items {
          gap: 2px;
        }

        .ckeditor-wrapper .ck.ck-button {
          border-radius: 6px !important;
        }

        .ckeditor-wrapper .ck.ck-button:hover {
          background: #eff6ff !important;
        }

        .ckeditor-wrapper
          .ck.ck-button.ck-on {
          background: #dbeafe !important;
          color: #2563eb !important;
        }

        /* ==========================================
           EDITOR
        ========================================== */

        .ckeditor-wrapper
          .ck.ck-editor__main
          > .ck-editor__editable {
          border: 0 !important;
        }

        .ckeditor-wrapper
          .ck.ck-editor__editable.ck-focused {
          border: 0 !important;

          box-shadow:
            inset 0 0 0 1px #2563eb !important;
        }

        .ckeditor-wrapper
          .ck-editor__editable_inline {
          min-height: ${minHeight}px !important;
          padding: 20px 24px !important;
        }

        /* ==========================================
           CONTENT
        ========================================== */

        .ckeditor-wrapper .ck-content {
          min-height: ${minHeight}px;
          font-size: 15px;
          line-height: 1.8;
          color: #374151;
        }

        .ckeditor-wrapper .ck-content h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 1.5rem 0 1rem;
        }

        .ckeditor-wrapper .ck-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 1.5rem 0 1rem;
        }

        .ckeditor-wrapper .ck-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.25rem 0 0.75rem;
        }

        .ckeditor-wrapper .ck-content h4 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem;
        }

        .ckeditor-wrapper .ck-content p {
          margin-bottom: 0.75rem;
        }

        /* ==========================================
           BLOCKQUOTE
        ========================================== */

        .ckeditor-wrapper
          .ck-content
          blockquote {
          border-left: 4px solid #2563eb;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #6b7280;
        }

        /* ==========================================
           TABLE
        ========================================== */

        .ckeditor-wrapper .ck-content table {
          width: 100%;
        }

        /* ==========================================
           LIST
        ========================================== */

        .ckeditor-wrapper .ck-content ul,
        .ckeditor-wrapper .ck-content ol {
          padding-left: 2rem;
        }

        /* ==========================================
           IMAGE
        ========================================== */

        .ckeditor-wrapper .ck-content figure.image {
          margin: 1.5rem auto;
        }

        .ckeditor-wrapper .ck-content figure.image img {
          max-width: 100%;
          height: auto;
        }

        .ckeditor-wrapper .ck-content figure.image.image-style-side {
          max-width: 50%;
          float: right;
          margin-left: 1.5rem;
        }

        .ckeditor-wrapper .ck-content figure.image.image-style-align-left {
          margin-left: 0;
          margin-right: auto;
        }

        .ckeditor-wrapper .ck-content figure.image.image-style-align-center {
          margin-left: auto;
          margin-right: auto;
        }

        .ckeditor-wrapper .ck-content figure.image.image-style-align-right {
          margin-left: auto;
          margin-right: 0;
        }
      `}</style>
    </div>
  );
}
