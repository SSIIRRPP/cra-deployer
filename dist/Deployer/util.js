"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processResponses = exports.processResponse = void 0;
const processResponse = (r) => {
    var _a, _b, _c;
    return ((_b = (_a = r === null || r === void 0 ? void 0 : r.$metadata) === null || _a === void 0 ? void 0 : _a.httpStatusCode) === null || _b === void 0 ? void 0 : _b.toString().startsWith("2")) ||
        ((_c = r === null || r === void 0 ? void 0 : r.$metadata) === null || _c === void 0 ? void 0 : _c.httpStatusCode) === 304 ||
        false;
};
exports.processResponse = processResponse;
const processResponses = (array) => array.every((r) => (0, exports.processResponse)(r));
exports.processResponses = processResponses;
