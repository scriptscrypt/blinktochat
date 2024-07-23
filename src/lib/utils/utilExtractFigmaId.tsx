/**
 * Extracts the fileId from a Figma link.
 * @param {string} figmaLink - The shared Figma link.
 * @returns {string|null} - The extracted fileId or null if not found.
 */
export function utilExtractFigmaId(figmaLink: string): string | null {
  // Decode the URL
  const decodedUrl = decodeURIComponent(figmaLink);
  const regex = /https:\/\/www\.figma\.com\/(file|design)\/([a-zA-Z0-9]+)\//;
  const match = decodedUrl.match(regex);
  return match ? match[2] : null;
}
