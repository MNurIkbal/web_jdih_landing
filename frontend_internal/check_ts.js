const ts = require("./node_modules/typescript");
const fs = require("fs");
const file = "./feature/pengajuan-peraturan/components/PengajuanPeraturanComponent.tsx";
const program = ts.createProgram([file], {
  jsx: ts.JsxEmit.ReactJSX,
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  noEmit: true,
  skipLibCheck: true
});
const diagnostics = ts.getPreEmitDiagnostics(program);
diagnostics.forEach(diag => {
  if (diag.file && diag.file.fileName.includes("PengajuanPeraturanComponent")) {
    const pos = diag.file.getLineAndCharacterOfPosition(diag.start);
    console.log("Line " + (pos.line + 1) + ":" + (pos.character + 1) + " - TS" + diag.code + ": " + diag.messageText);
  }
});

