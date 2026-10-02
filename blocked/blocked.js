document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const domainParam = urlParams.get('domain');
  const rawUrlParam = urlParams.get('url');

  const domainEl = document.getElementById('blocked-domain');
  const attemptedUrlEl = document.getElementById('attempted-url');
  const fullUrlRow = document.getElementById('full-url-row');

  let activeDomain = domainParam;

  if (!activeDomain && rawUrlParam) {
    activeDomain = extractBaseDomain(rawUrlParam);
  }

  if (activeDomain) {
    domainEl.textContent = activeDomain;
  } else {
    domainEl.textContent = 'Specified Base URL';
  }

  if (rawUrlParam) {
    fullUrlRow.style.display = 'flex';
    attemptedUrlEl.textContent = rawUrlParam;
  }

  // Go Back
  document.getElementById('btn-back').addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  });

  // Open settings/options page
  document.getElementById('btn-settings').addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options/options.html'));
    }
  });
});
