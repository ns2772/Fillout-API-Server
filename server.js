const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/:formId/filteredResponses', async (req, res) => {
  const { formId } = req.params;
  const { page, pageSize, filters } = req.query;
  const apiUrl = `https://www.fillout.com/api/v1/forms/${formId}/responses?page=${page}&pageSize=${pageSize}`;
  const headers = { Authorization: 'Bearer YOUR_API_KEY_HERE' };

  try {
    const response = await axios.get(apiUrl, { headers });
    const filteredResponses = applyFilters(response.data.responses, JSON.parse(filters));
    // Modify the response to include filtered totalResponses and pageCount
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
