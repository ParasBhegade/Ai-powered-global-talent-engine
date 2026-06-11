const fs = require('fs');
const path = require('path');

/**
 * Extract plain text from a PDF or DOCX file.
 * @param {string} filePath - Absolute path to the uploaded file
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromResume(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    return extractFromPDF(filePath);
  } else if (ext === '.docx') {
    return extractFromDOCX(filePath);
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }
}

async function extractFromPDF(filePath) {
  const pdfParse = require('pdf-parse');
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text || '';
}

async function extractFromDOCX(filePath) {
  const mammoth = require('mammoth');
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value || '';
}

/**
 * Clean up the temporary resume file after processing.
 */
function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn('Could not delete temp resume file:', err.message);
  }
}

module.exports = { extractTextFromResume, deleteFile };
