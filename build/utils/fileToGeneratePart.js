"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileToGeneratePart = void 0;
const fileToGeneratePart = (path) => {
    return {
        fileData: {
            mimeType: path.file.mimeType,
            fileUri: path.file.uri,
        },
    };
};
exports.fileToGeneratePart = fileToGeneratePart;
