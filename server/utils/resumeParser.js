const { callGroq, extractJSON } = require('./groq');

/**
 * Extract plain text from a resume buffer.
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromBuffer(buffer, mimeType) {
  if (mimeType === 'application/pdf') {
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    return data.text || '';
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } else if (mimeType === 'text/plain') {
    return buffer.toString('utf-8');
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

/**
 * Parse a resume buffer using Groq and return structured JSON.
 * Returns partial/empty array structures on failure.
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - File MIME type
 * @returns {Promise<{rawText: string, parsedData: object}>}
 */
async function parseResume(buffer, mimeType) {
  let rawText = '';
  
  // Basic empty structure to return if things fail, with basic regex fallback for contact info
  const fallbackData = {
    name: "Manual Review Required",
    email: "",
    phone: "",
    skills: ["Extraction Failed - Check AI API Key"],
    experience: [],
    education: [],
    certifications: []
  };

  try {
    rawText = await extractTextFromBuffer(buffer, mimeType);
    
    // Attempt basic fallback extraction just in case
    const emailMatch = rawText.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) fallbackData.email = emailMatch[0];
    
    const phoneMatch = rawText.match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/);
    if (phoneMatch) fallbackData.phone = phoneMatch[0];
    
  } catch (err) {
    console.error('Error extracting text from resume:', err.message);
    return { rawText: '', parsedData: fallbackData };
  }

  if (!rawText || rawText.trim().length < 20) {
    return { rawText, parsedData: fallbackData };
  }

  const prompt = `You are a professional resume parser. Extract the following structured information from the resume text below.

RULES:
- Extract ONLY what is explicitly stated in the resume. Do NOT invent or guess information.
- For "experience", list each job/role as a string in the array.
- For "skills", return an array of strings of technical and soft skills.
- For "education", return an array of strings combining degree, institution, and year.
- For "certifications", return an array of strings of any certifications or licenses.
- If a field is not found, return an empty array or empty string as appropriate.

Return ONLY valid JSON in this exact schema:
{
  "name": "Person's full name",
  "email": "Email address if found",
  "phone": "Phone number if found",
  "skills": ["Skill1", "Skill2"],
  "experience": ["Role at Company (Duration)", "Role at Company (Duration)"],
  "education": ["Degree, Institution, Year"],
  "certifications": ["Cert 1", "Cert 2"]
}

RESUME TEXT:
${rawText.substring(0, 6000)}`;

  try {
    const content = await callGroq([
      { role: 'system', content: 'You are a precise resume data extractor. Output ONLY valid JSON, no markdown, no commentary.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.0, maxTokens: 1000 });

    const parsed = extractJSON(content);

    if (parsed) {
      // Ensure the returned object has the correct schema types
      return {
        rawText,
        parsedData: {
          name: parsed.name || "",
          email: parsed.email || "",
          phone: parsed.phone || "",
          skills: Array.isArray(parsed.skills) ? parsed.skills : [],
          experience: Array.isArray(parsed.experience) ? parsed.experience : [],
          education: Array.isArray(parsed.education) ? parsed.education : [],
          certifications: Array.isArray(parsed.certifications) ? parsed.certifications : []
        }
      };
    } else {
      console.warn('Groq returned invalid JSON for resume parsing');
      return { rawText, parsedData: fallbackData };
    }
  } catch (err) {
    console.error('Groq AI error during resume parsing:', err.message);
    return { rawText, parsedData: fallbackData };
  }
}

module.exports = { parseResume, extractTextFromBuffer };
