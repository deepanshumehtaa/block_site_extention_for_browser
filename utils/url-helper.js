/**
 * URL Helper utilities for Site Blocker
 */

/**
 * Extracts and normalizes the base domain/hostname from a raw URL or domain string.
 * Examples:
 *  - "https://www.facebook.com/path?q=1" -> "facebook.com"
 *  - "http://sub.domain.com:8080" -> "sub.domain.com"
 *  - "twitter.com/home" -> "twitter.com"
 *  - "  EXAMPLE.COM  " -> "example.com"
 */
function extractBaseDomain(input) {
  if (!input || typeof input !== 'string') return '';
  
  let str = input.trim().toLowerCase();
  
  // Add protocol if missing so URL constructor can parse it
  if (!str.startsWith('http://') && !str.startsWith('https://')) {
    str = 'http://' + str;
  }
  
  try {
    const parsed = new URL(str);
    let hostname = parsed.hostname;
    
    // Remove leading www.
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    return hostname;
  } catch (e) {
    // Basic fallback regex clean up if URL constructor fails
    let cleaned = input.trim().toLowerCase();
    cleaned = cleaned.replace(/^https?:\/\//i, '');
    cleaned = cleaned.replace(/^www\./i, '');
    cleaned = cleaned.split('/')[0];
    cleaned = cleaned.split('?')[0];
    cleaned = cleaned.split(':')[0];
    return cleaned;
  }
}

/**
 * Checks if a candidate URL matches a blocked domain/base URL.
 * Matches exact domain, www variant, and subdomains.
 * e.g., blockedDomain "example.com" matches:
 *   - https://example.com
 *   - https://www.example.com
 *   - https://blog.example.com/path
 */
function isUrlBlocked(targetUrlStr, blockedDomain) {
  if (!targetUrlStr || !blockedDomain) return false;
  
  const normBlocked = extractBaseDomain(blockedDomain);
  if (!normBlocked) return false;
  
  try {
    const urlObj = new URL(targetUrlStr);
    let targetHost = urlObj.hostname.toLowerCase();
    
    if (targetHost.startsWith('www.')) {
      targetHost = targetHost.substring(4);
    }
    
    // Exact match or subdomain match
    if (targetHost === normBlocked || targetHost.endsWith('.' + normBlocked)) {
      return true;
    }
  } catch (e) {
    // Ignore invalid target URLs (like chrome:// or file://)
  }
  
  return false;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { extractBaseDomain, isUrlBlocked };
}
