import express, { Request, Response } from 'express';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

interface FilterClauseType {
  id: string;
  condition: 'equals' | 'does_not_equal' | 'greater_than' | 'less_than';
  value: string | number;
}

const API_KEY = 'your_fillout_api_key_here'; // Replace with your actual Fillout.com API key

app.get('/:formId/filteredResponses', async (req: Request, res: Response) => {
  const { formId } = req.params;
  const { page = '1', pageSize = '10', filters = '[]' } = req.query;
  const apiUrl = `https://www.fillout.com/api/v1/forms/${formId}/responses?page=${page}&pageSize=${pageSize}`;
  const headers = { Authorization: `Bearer ${API_KEY}` };

  try {
    const response = await axios.get(apiUrl, { headers });
    const responses = response.data.responses;

    const parsedFilters: FilterClauseType[] = JSON.parse(filters as string);
    const filteredResponses = applyFilters(responses, parsedFilters);

    const result = {
      responses: filteredResponses,
      totalResponses: filteredResponses.length,
      pageCount: Math.ceil(filteredResponses.length / Number(pageSize))
    };
    res.json(result);
  } catch (error) {
    // Check if error is an instance of Error and then access its message
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Failed to fetch form responses:', message);
    res.status(500).json({ message: 'Internal server error', details: message });
  }
});

function applyFilters(responses: any[], filters: FilterClauseType[]) {
  return responses.filter(response => {
    return filters.every(filter => {
      const question = response.questions.find((q: any) => q.id === filter.id);
      if (!question) return false;
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
