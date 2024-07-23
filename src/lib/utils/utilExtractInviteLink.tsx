/**
 * Extracts the fileId from a invite link.
 * @param {string} tgLink - The generated telegram invite link.
 * @returns {string|null} - The extracted fileId or null if not found.
 */
export function utilExtractInviteLink(tgLink: string): string | null {
  // Decode the URL
  const decodedUrl = decodeURIComponent(tgLink);
  
  // Regular expression to match Telegram invite links
  const regex = /https:\/\/t\.me\/(\+[a-zA-Z0-9_-]+)/;
  
  const match = decodedUrl.match(regex);
  
  // Return the extracted invite code or null if no match
  return match ? match[1] : null;
}