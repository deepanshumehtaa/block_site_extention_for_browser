document.addEventListener('DOMContentLoaded', async () => {
  const masterToggle = document.getElementById('toggle-master');
  const currentDomainText = document.getElementById('current-domain-text');
  const btnBlockCurrent = document.getElementById('btn-block-current');
  const addForm = document.getElementById('add-form');
  const siteInput = document.getElementById('site-input');
  const errorMsg = document.getElementById('error-msg');
  const sitesList = document.getElementById('sites-list');
  const sitesCount = document.getElementById('sites-count');
  const emptyState = document.getElementById('empty-state');
  const btnOpenOptions = document.getElementById('btn-open-options');

  let activeTabDomain = '';

  // Get active tab URL
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('edge://') && !tab.url.startsWith('about:')) {
      activeTabDomain = extractBaseDomain(tab.url);
      if (activeTabDomain) {
        currentDomainText.textContent = activeTabDomain;
        btnBlockCurrent.disabled = false;
      } else {
        currentDomainText.textContent = 'System Page';
        btnBlockCurrent.disabled = true;
      }
    } else {
      currentDomainText.textContent = 'System Page';
      btnBlockCurrent.disabled = true;
    }
  } catch (err) {
    currentDomainText.textContent = 'Unavailable';
    btnBlockCurrent.disabled = true;
  }

  // Load and render status
  async function loadStatus() {
    chrome.runtime.sendMessage({ action: 'GET_STATUS' }, (response) => {
      if (!response || !response.success) return;

      masterToggle.checked = response.isEnabled;
      renderSitesList(response.blockedSites);

      // Check if current site is already blocked
      if (activeTabDomain) {
        const isAlreadyBlocked = response.blockedSites.some(s => {
          const d = typeof s === 'string' ? s : s.domain;
          return d === activeTabDomain;
        });

        if (isAlreadyBlocked) {
          btnBlockCurrent.textContent = 'Current Site is Blocked';
          btnBlockCurrent.disabled = true;
        } else {
          btnBlockCurrent.textContent = 'Block Current Site';
          btnBlockCurrent.disabled = false;
        }
      }
    });
  }

  function renderSitesList(sites) {
    sitesList.innerHTML = '';
    
    // Display ONLY the 2 most recently added sites
    const recentSites = sites.slice(-2).reverse();
    sitesCount.textContent = recentSites.length;

    if (recentSites.length === 0) {
      emptyState.style.display = 'block';
      sitesList.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';
    sitesList.style.display = 'flex';

    recentSites.forEach(site => {
      const domain = typeof site === 'string' ? site : site.domain;
      const li = document.createElement('li');
      li.className = 'site-item';

      const domainSpan = document.createElement('span');
      domainSpan.className = 'domain-name';
      domainSpan.textContent = domain;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-delete-site';
      deleteBtn.title = 'Remove block';
      deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

      deleteBtn.addEventListener('click', () => {
        removeSite(domain);
      });

      li.appendChild(domainSpan);
      li.appendChild(deleteBtn);
      sitesList.appendChild(li);
    });
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
    setTimeout(() => {
      errorMsg.style.display = 'none';
    }, 3000);
  }

  function addSite(domainStr) {
    chrome.runtime.sendMessage({ action: 'ADD_SITE', domain: domainStr }, (res) => {
      if (res && res.success) {
        siteInput.value = '';
        loadStatus();
      } else {
        showError(res ? res.error : 'Failed to add site');
      }
    });
  }

  function removeSite(domainStr) {
    chrome.runtime.sendMessage({ action: 'REMOVE_SITE', domain: domainStr }, (res) => {
      if (res && res.success) {
        loadStatus();
      }
    });
  }

  // Master toggle event
  masterToggle.addEventListener('change', () => {
    chrome.runtime.sendMessage({ action: 'TOGGLE_ENABLED' }, () => {
      loadStatus();
    });
  });

  // Block Current Site button event
  btnBlockCurrent.addEventListener('click', () => {
    if (activeTabDomain) {
      addSite(activeTabDomain);
    }
  });

  // Form submit
  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = siteInput.value.trim();
    if (val) {
      addSite(val);
    }
  });

  // Open options dashboard
  btnOpenOptions.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options/options.html'));
    }
  });

  await loadStatus();
});
