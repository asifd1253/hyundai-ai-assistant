const extractPdfText = require("./utils/pdfExtractor");

const testExtraction = async () => {
  try {
    // Replace this with the actual PDF path
    const filePath = "./uploads/brochures/1795427814108-292373500.pdf";

    const pages = await extractPdfText(filePath);

    console.log("PDF extraction successful!");
    console.log("Total pages:", pages.length);

    pages.forEach((page) => {
      console.log(`\n--- PAGE ${page.pageNumber} ---`);

      console.log(page.text.substring(0, 500));

      console.log("Extracted characters:", page.text.length);
    });
  } catch (error) {
    console.error("Extraction test failed:", error);
  }
};

testExtraction();
