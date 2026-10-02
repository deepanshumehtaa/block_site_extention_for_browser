importScripts('../utils/url-helper.js');

// Synchronize declarativeNetRequest dynamic rules based on blocked domain list
async function updateDeclarativeRules() {
  try {
    const data = await chrome.storage.local.get(['blockedSites', 'isEnabled']);
    const blockedSites = data.blockedSites || [];
    const isEnabled = data.isEnabled !== false; // Default true

    // Retrieve existing dynamic rules
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map(r => r.id);

    if (!isEnabled || blockedSites.length === 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds,
        addRules: []
      });
      return;
    }

    const newRules = blockedSites.map((site, index) => {
      const domain = typeof site === 'string' ? site : site.domain;
      const normalized = extractBaseDomain(domain);
      const ruleId = index + 1;
      
      const blockedPageUrl = chrome.runtime.getURL('blocked/blocked.html');
      
      return {
        id: ruleId,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            // Redirect to blocked.html with target domain as query parameter
            url: `${blockedPageUrl}?domain=${encodeURIComponent(normalized)}`
          }
        },
        condition: {
          urlFilter: `||${normalized}^`,
          resourceTypes: ['main_frame']
        }
      };
    });

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds,
      addRules: newRules
    });
  } catch (err) {
    console.error('Error updating declarative net rules:', err);
  }
}

// Fallback & dynamic tab navigation interceptor
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only process main frame navigations
  if (details.frameId !== 0) return;
  
  // Skip extension internal pages
  if (details.url.startsWith(chrome.runtime.getURL(''))) return;
  if (details.url.startsWith('chrome://') || details.url.startsWith('edge://') || details.url.startsWith('about:')) return;

  const data = await chrome.storage.local.get(['blockedSites', 'isEnabled', 'blockStats']);
  const isEnabled = data.isEnabled !== false;
  const blockedSites = data.blockedSites || [];

  if (!isEnabled || blockedSites.length === 0) return;

  for (const site of blockedSites) {
    const domain = typeof site === 'string' ? site : site.domain;
    if (isUrlBlocked(details.url, domain)) {
      // Increment block count stats
      const stats = data.blockStats || {};
      const normDomain = extractBaseDomain(domain);
      stats[normDomain] = (stats[normDomain] || 0) + 1;
      await chrome.storage.local.set({ blockStats: stats });

      const blockedUrl = chrome.runtime.getURL(`blocked/blocked.html?url=${encodeURIComponent(details.url)}&domain=${encodeURIComponent(normDomain)}`);
      
      chrome.tabs.update(details.tabId, { url: blockedUrl });
      break;
    }
  }
});

// React to storage updates
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && (changes.blockedSites || changes.isEnabled)) {
    updateDeclarativeRules();
  }
});

// Message handler for runtime communication between Popup/Options/Blocked page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message.action === 'ADD_SITE') {
      const normDomain = extractBaseDomain(message.domain);
      if (!normDomain) {
        sendResponse({ success: false, error: 'Invalid URL or domain' });
        return;
      }

      const data = await chrome.storage.local.get('blockedSites');
      const sites = data.blockedSites || [];

      const exists = sites.some(s => (typeof s === 'string' ? s : s.domain) === normDomain);
      if (exists) {
        sendResponse({ success: false, error: 'Site is already in blocked list' });
        return;
      }

      sites.push({
        domain: normDomain,
        addedAt: new Date().toISOString()
      });

      await chrome.storage.local.set({ blockedSites: sites });
      await updateDeclarativeRules();
      sendResponse({ success: true, domain: normDomain });
    }
    else if (message.action === 'REMOVE_SITE') {
      const normDomain = extractBaseDomain(message.domain);
      const data = await chrome.storage.local.get('blockedSites');
      const sites = data.blockedSites || [];

      const filtered = sites.filter(s => (typeof s === 'string' ? s : s.domain) !== normDomain);
      await chrome.storage.local.set({ blockedSites: filtered });
      await updateDeclarativeRules();
      sendResponse({ success: true, domain: normDomain });
    }
    else if (message.action === 'TOGGLE_ENABLED') {
      const data = await chrome.storage.local.get('isEnabled');
      const newState = ! (data.isEnabled !== false);
      await chrome.storage.local.set({ isEnabled: newState });
      await updateDeclarativeRules();
      sendResponse({ success: true, isEnabled: newState });
    }
    else if (message.action === 'GET_STATUS') {
      const data = await chrome.storage.local.get(['blockedSites', 'isEnabled', 'blockStats']);
      sendResponse({
        success: true,
        isEnabled: data.isEnabled !== false,
        blockedSites: data.blockedSites || [],
        blockStats: data.blockStats || {}
      });
    }
  })();
  return true; // Keep channel open for async response
});

// Initialize on extension installation / update
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(['blockedSites', 'isEnabled', 'blockStats']);
  
  if (data.isEnabled === undefined) {
    await chrome.storage.local.set({ isEnabled: true });
  }

  // Pre-load default 100 blocked sites if blockedSites list is uninitialized or empty
  if (!data.blockedSites || data.blockedSites.length === 0) {
    try {
      const defaultUrl = chrome.runtime.getURL('defaults/default-blocked-sites.json');
      const resp = await fetch(defaultUrl);
      const defaultDomains = await resp.json();
      
      const initialSites = defaultDomains.map(domain => ({
        domain: extractBaseDomain(domain),
        addedAt: new Date().toISOString()
      }));

      await chrome.storage.local.set({ blockedSites: initialSites });
    } catch (err) {
      console.error('Failed to load default blocked sites list:', err);
      await chrome.storage.local.set({ blockedSites: [] });
    }
  }

  if (!data.blockStats) {
    await chrome.storage.local.set({ blockStats: {} });
  }
  
  await updateDeclarativeRules();
});
