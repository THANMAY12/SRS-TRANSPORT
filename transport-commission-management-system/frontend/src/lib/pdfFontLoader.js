/**
 * Utility to load and register TrueType font in jsPDF to ensure
 * the Indian Rupee symbol (₹) and numbers render natively without
 * encoding corruption or artificial letter-spacing.
 */
export async function loadCustomPdfFont(doc) {
  try {
    const response = await fetch("/fonts/CustomFont.ttf");
    if (!response.ok) {
      console.warn("Custom PDF font not found via fetch, status:", response.status);
      return false;
    }
    const buffer = await response.arrayBuffer();
    const binary = new Uint8Array(buffer);
    let binaryString = "";
    const len = binary.byteLength;
    const chunkSize = 8192;
    for (let i = 0; i < len; i += chunkSize) {
      binaryString += String.fromCharCode.apply(null, binary.subarray(i, i + chunkSize));
    }
    const fontBase64 = btoa(binaryString);

    doc.addFileToVFS("CustomFont.ttf", fontBase64);
    doc.addFont("CustomFont.ttf", "CustomFont", "normal");
    doc.addFont("CustomFont.ttf", "CustomFont", "bold");
    doc.setFont("CustomFont");
    return true;
  } catch (err) {
    console.warn("Failed to load custom PDF font, falling back to standard font:", err);
    return false;
  }
}
