import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

interface FilterClauseType {
  id: string;
  condition: 'equals' | 'does_not_equal' | 'greater_than' | 'less_than';
  value: string | number;
}

const API_KEY =
  'sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912';

app.get('/:formId/filteredResponses', async (req: Request, res: Response) => {
  const { formId } = req.params;
  const { filters = '[]', ...rest } = req.query;

  let q = '';
  if (Object.keys(rest).length) {
    q = `?${getQueryStringFromObject(rest)}`;
  }

  const apiUrl = `https://api.fillout.com/v1/api/forms/${formId}/submissions${q}`;
  const headers = { Authorization: `Bearer ${API_KEY}` };

  try {
    const response = await axios.get(apiUrl, {
      headers,
    });
    const responses = response.data.responses;

    const parsedFilters: FilterClauseType[] = JSON.parse(filters as string);
    const filteredResponses = applyFilters(responses, parsedFilters);

    const result = {
      responses: filteredResponses,
      totalResponses: filteredResponses.length,
      pageCount: rest.offset ? Number(rest.offset) + 1 : 1,
    };
    res.json(result);
  } catch (error) {
    // Check if error is an instance of Error and then access its message
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Failed to fetch form responses:', message);
    res
      .status(500)
      .json({ message: 'Internal server error', details: message });
  }
});

function getQueryStringFromObject(obj: any) {
  return Object.keys(obj)
    .map((key) => {
      return `${key}=${encodeURIComponent(obj[key] as string)}`;
    })
    .join('&');
}

function applyFilters(responses: any[], filters: FilterClauseType[]) {
  return responses.filter((response) => {
    return filters.every((filter) => {
      const question = response.questions.find((q: any) => q.id === filter.id);
      if (!question) return false;
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
