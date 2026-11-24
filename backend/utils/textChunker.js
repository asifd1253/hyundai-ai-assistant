const chunkPages = (pages, chunkSize = 180, overlap = 30) => {
  if (overlap >= chunkSize) {
    throw new Error("Overlap must be smaller than chunk size.");
  }

  const chunks = [];

  for (const page of pages) {
    const words = page.text.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) {
      continue;
    }

    let start = 0;
    let chunkIndex = 0;

    while (start < words.length) {
      const end = Math.min(start + chunkSize, words.length);

      const chunkText = words.slice(start, end).join(" ");

      chunks.push({
        pageNumber: page.pageNumber,
        chunkIndex,
        text: chunkText,
      });

      if (end === words.length) {
        break;
      }

      start = end - overlap;
      chunkIndex++;
    }
  }

  return chunks;
};

module.exports = chunkPages;
