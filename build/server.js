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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
const API_KEY = 'your_fillout_api_key_here'; // Replace with your actual Fillout.com API key
app.get('/:formId/filteredResponses', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { formId } = req.params;
    const { page = '1', pageSize = '10', filters = '[]' } = req.query;
    const apiUrl = `https://www.fillout.com/api/v1/forms/${formId}/responses?page=${page}&pageSize=${pageSize}`;
    const headers = { Authorization: `Bearer ${API_KEY}` };
    try {
        const response = yield axios_1.default.get(apiUrl, { headers });
        const responses = response.data.responses;
        const parsedFilters = JSON.parse(filters);
        const filteredResponses = applyFilters(responses, parsedFilters);
        const result = {
            responses: filteredResponses,
            totalResponses: filteredResponses.length,
            pageCount: Math.ceil(filteredResponses.length / Number(pageSize))
        };
        res.json(result);
    }
    catch (error) {
        // Check if error is an instance of Error and then access its message
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Failed to fetch form responses:', message);
        res.status(500).json({ message: 'Internal server error', details: message });
    }
}));
function applyFilters(responses, filters) {
    return responses.filter(response => {
        return filters.every(filter => {
            const question = response.questions.find((q) => q.id === filter.id);
            if (!question)
                return false;
            switch (filter.condition) {
                case 'equals': return question.value.toString() === filter.value.toString();
                case 'does_not_equal': return question.value.toString() !== filter.value.toString();
                case 'greater_than': return new Date(question.value) > new Date(filter.value);
                case 'less_than': return new Date(question.value) < new Date(filter.value);
                default: return true;
            }
        });
    });
}
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
