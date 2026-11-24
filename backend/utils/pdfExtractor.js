const fs = require("fs/promises");

const extractPdfText = async (filePath) => {
  try {
    // Load PDF.js using dynamic import
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

    // Read PDF from the server
    const fileBuffer = await fs.readFile(filePath);

    const pdfData = new Uint8Array(fileBuffer);

    // Load PDF document
    const pdfDocument = await pdfjsLib.getDocument({
      data: pdfData,
    }).promise;

    const pages = [];

    // Extract text page by page
    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const page = await pdfDocument.getPage(pageNumber);

      const textContent = await page.getTextContent();

      const pageText = textContent.items.map((item) => item.str).join(" ");

      pages.push({
        pageNumber,
        text: pageText.trim(),
      });
    }

    return pages;
  } catch (error) {
    console.error("PDF extraction failed:", error);
    throw new Error("Unable to extract text from PDF.");
  }
};

module.exports = extractPdfText;
