const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Fillout.com API details
const API_KEY = 'sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912';
const FORM_ID = 'cLZojxk94ous'; // Using the demo form ID directly in the route might not be ideal for a flexible API design.

app.get(`/${FORM_ID}/filteredResponses`, async (req, res) => {
  const { page = 1, pageSize = 10, filters } = req.query;
  const apiUrl = `https://www.fillout.com/api/v1/forms/${FORM_ID}/responses?page=${page}&pageSize=${pageSize}`;
  const headers = { Authorization: `Bearer ${API_KEY}` };

  try {
    const response = await axios.get(apiUrl, { headers });
    const responses = response.data.responses;
    const filteredResponses = filters ? applyFilters(responses, JSON.parse(filters)) : responses;
    const result = {
      responses: filteredResponses,
      totalResponses: filteredResponses.length,
      pageCount: Math.ceil(filteredResponses.length / pageSize)
    };
    res.json(result);
  } catch (error) {
    console.error('Error fetching form responses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

function applyFilters(responses, filters) {
  return responses.filter(response => {
    return filters.every(filter => {
      const question = response.questions.find(q => q.id === filter.id);
      if (!question) return false;
      switch (filter.condition) {
        case 'equals': return question.value === filter.value;
        case 'does_not_equal': return question.value !== filter.value;
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
