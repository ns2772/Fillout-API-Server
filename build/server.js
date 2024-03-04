"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const API_KEY = 'sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912';
app.get('/:formId/filteredResponses', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { formId } = req.params;
    const _a = req.query, { filters = '[]' } = _a, rest = __rest(_a, ["filters"]);
    let q = '';
    if (Object.keys(rest).length) {
        q = `?${getQueryStringFromObject(rest)}`;
    }
    const apiUrl = `https://api.fillout.com/v1/api/forms/${formId}/submissions${q}`;
    const headers = { Authorization: `Bearer ${API_KEY}` };
    try {
        const response = yield axios_1.default.get(apiUrl, {
            headers,
        });
        const responses = response.data.responses;
        const parsedFilters = JSON.parse(filters);
        const filteredResponses = applyFilters(responses, parsedFilters);
        const result = {
            responses: filteredResponses,
            totalResponses: filteredResponses.length,
            pageCount: rest.offset ? Number(rest.offset) + 1 : 1,
        };
        res.json(result);
    }
    catch (error) {
        // Check if error is an instance of Error and then access its message
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Failed to fetch form responses:', message);
        res
            .status(500)
            .json({ message: 'Internal server error', details: message });
    }
}));
function getQueryStringFromObject(obj) {
    return Object.keys(obj)
        .map((key) => {
        return `${key}=${encodeURIComponent(obj[key])}`;
    })
        .join('&');
}
function applyFilters(responses, filters) {
    return responses.filter((response) => {
        return filters.every((filter) => {
            const question = response.questions.find((q) => q.id === filter.id);
            if (!question)
                return false;
            switch (filter.condition) {
                case 'equals':
                    return question.value === filter.value;
                case 'does_not_equal':
                    return question.value !== filter.value;
                case 'greater_than':
                    return new Date(question.value) > new Date(filter.value);
                case 'less_than':
                    return new Date(question.value) < new Date(filter.value);
                default:
                    return true;
            }
        });
    });
}
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
