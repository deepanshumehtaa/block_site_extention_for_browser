document.addEventListener('DOMContentLoaded', () => {
  const masterToggle = document.getElementById('master-toggle');
  const statusBadge = document.getElementById('status-badge');
  const statusText = document.getElementById('status-text');
  
  const statCount = document.getElementById('stat-count');
  const statRedirects = document.getElementById('stat-redirects');
  const statStatus = document.getElementById('stat-status');
  
  const addForm = document.getElementById('add-form');
  const domainInput = document.getElementById('domain-input');
  const alertMessage = document.getElementById('alert-message');
  
  const tableCount = document.getElementById('table-count');
  const searchInput = document.getElementById('search-input');
  const tableBody = document.getElementById('table-body');
  const tableEmpty = document.getElementById('table-empty');
  
  const btnExport = document.getElementById('btn-export');
  const btnImportTrigger = document.getElementById('btn-import-trigger');
  const fileImport = document.getElementById('file-import');

  // Math Modal Elements
  const mathModal = document.getElementById('math-modal');
  const modalClose = document.getElementById('modal-close');
  const modalTargetDomain = document.getElementById('modal-target-domain');
  const mathCanvas = document.getElementById('math-canvas');
  const mathForm = document.getElementById('math-form');
  const mathAnswerInput = document.getElementById('math-answer-input');
  const mathError = document.getElementById('math-error');
  const mathBox = document.getElementById('math-box');

  let currentBlockedSites = [];
  let currentBlockStats = {};
  
  // Math verification state
  let pendingDomainToUnblock = null;
  let currentMathChallenge = null;

  // Anti-Copy Event Handlers
  if (mathBox) {
    ['copy', 'cut', 'contextmenu', 'selectstart', 'dragstart'].forEach(evt => {
      mathBox.addEventListener(evt, (e) => e.preventDefault());
    });
  }

  function renderMathQuestionOnCanvas(questionText) {
    const ctx = mathCanvas.getContext('2d');
    ctx.clearRect(0, 0, mathCanvas.width, mathCanvas.height);

    // Canvas Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, mathCanvas.width, mathCanvas.height);

    // Draw background security noise lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * mathCanvas.width, 0);
      ctx.lineTo(Math.random() * mathCanvas.width, mathCanvas.height);
      ctx.stroke();
    }

    // Text Styling
    ctx.font = 'bold 19px -apple-system, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillText(questionText, mathCanvas.width / 2, mathCanvas.height / 2);
  }

  function openMathModal(domain) {
    pendingDomainToUnblock = domain;
    modalTargetDomain.textContent = domain;
    mathError.style.display = 'none';
    mathAnswerInput.value = '';

    // Generate math question with MD5 answer hash
    if (typeof generateMathChallenge === 'function') {
      currentMathChallenge = generateMathChallenge();
    } else {
      const q = "Solve for x: 7x - 45 = 172";
      const h = typeof md5 === 'function' ? md5("31") : "c16a5320fa475530d9583c34fd356ef5";
      currentMathChallenge = { question: q, answerHash: h };
    }

    renderMathQuestionOnCanvas(currentMathChallenge.question);
    mathModal.style.display = 'flex';
    mathAnswerInput.focus();
  }

  function closeMathModal() {
    mathModal.style.display = 'none';
    pendingDomainToUnblock = null;
    currentMathChallenge = null;
  }

  modalClose.addEventListener('click', closeMathModal);

  mathModal.addEventListener('click', (e) => {
    if (e.target === mathModal) {
      closeMathModal();
    }
  });

  mathForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userTypedStr = mathAnswerInput.value.trim();

    if (!userTypedStr) {
      mathError.textContent = 'Please enter an answer.';
      mathError.style.display = 'block';
      return;
    }

    // Hash the user's typed input using MD5
    const userHash = typeof md5 === 'function' ? md5(userTypedStr) : userTypedStr;

    // Compare typed answer MD5 hash against the challenge MD5 answerHash
    if (userHash === currentMathChallenge.answerHash) {
      const domainToUnblock = pendingDomainToUnblock;
      closeMathModal();
      removeSite(domainToUnblock);
    } else {
      mathError.textContent = '❌ Incorrect answer! Try a new problem.';
      mathError.style.display = 'block';
      mathAnswerInput.value = '';

      // Generate a new fresh question on mistake
      if (typeof generateMathChallenge === 'function') {
        currentMathChallenge = generateMathChallenge();
      }
      renderMathQuestionOnCanvas(currentMathChallenge.question);
    }
  });

  function showAlert(msg, type = 'success') {
    alertMessage.textContent = msg;
    alertMessage.className = `alert-message ${type}`;
    alertMessage.style.display = 'block';
    setTimeout(() => {
      alertMessage.style.display = 'none';
    }, 4000);
  }

  function loadDashboard() {
    chrome.runtime.sendMessage({ action: 'GET_STATUS' }, (response) => {
      if (!response || !response.success) return;

      const isEnabled = response.isEnabled;
      currentBlockedSites = response.blockedSites || [];
      currentBlockStats = response.blockStats || {};

      masterToggle.checked = isEnabled;
      
      if (isEnabled) {
        statusBadge.className = 'status-badge';
        statusText.textContent = 'Protection Active';
        statStatus.textContent = 'ENABLED';
        statStatus.className = 'stat-value text-green';
      } else {
        statusBadge.className = 'status-badge disabled';
        statusText.textContent = 'Protection Paused';
        statStatus.textContent = 'DISABLED';
        statStatus.className = 'stat-value text-red';
      }

      // Stats calculation
      statCount.textContent = currentBlockedSites.length;
      tableCount.textContent = currentBlockedSites.length;

      let totalIntercepts = 0;
      Object.values(currentBlockStats).forEach(count => {
        totalIntercepts += count;
      });
      statRedirects.textContent = totalIntercepts;

      renderTable();
    });
  }

  function renderTable() {
    const filter = searchInput.value.trim().toLowerCase();
    tableBody.innerHTML = '';

    const filtered = currentBlockedSites.filter(site => {
      const domain = typeof site === 'string' ? site : site.domain;
      return domain.toLowerCase().includes(filter);
    });

    if (filtered.length === 0) {
      tableEmpty.style.display = 'block';
      return;
    }

    tableEmpty.style.display = 'none';

    filtered.forEach(site => {
      const domain = typeof site === 'string' ? site : site.domain;
      const addedAt = typeof site === 'object' && site.addedAt 
        ? new Date(site.addedAt).toLocaleDateString() 
        : 'N/A';
      const intercepts = currentBlockStats[domain] || 0;

      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td class="domain-cell">${escapeHtml(domain)}</td>
        <td>${escapeHtml(addedAt)}</td>
        <td>${intercepts}</td>
        <td class="text-right">
          <button class="btn btn-danger-sm btn-delete" data-domain="${escapeHtml(domain)}">Unblock</button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    // Attach click events to unblock buttons -> triggers Math Challenge!
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const domain = e.target.getAttribute('data-domain');
        openMathModal(domain);
      });
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function removeSite(domainStr) {
    chrome.runtime.sendMessage({ action: 'REMOVE_SITE', domain: domainStr }, (res) => {
      if (res && res.success) {
        showAlert(`Unblocked ${domainStr} successfully`, 'success');
        loadDashboard();
      }
    });
  }

  // Handle Form submit (Multi-line support)
  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rawText = domainInput.value.trim();
    if (!rawText) return;

    const lines = rawText.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    let addedCount = 0;
    let errors = [];

    for (const line of lines) {
      const norm = extractBaseDomain(line);
      if (!norm) {
        errors.push(`Invalid: ${line}`);
        continue;
      }

      await new Promise(resolve => {
        chrome.runtime.sendMessage({ action: 'ADD_SITE', domain: norm }, (res) => {
          if (res && res.success) {
            addedCount++;
          } else {
            errors.push(`${norm}: ${res ? res.error : 'Failed'}`);
          }
          resolve();
        });
      });
    }

    domainInput.value = '';
    loadDashboard();

    if (addedCount > 0) {
      showAlert(`Successfully added ${addedCount} base URL(s)`, 'success');
    } else if (errors.length > 0) {
      showAlert(`Error adding site(s): ${errors.join('; ')}`, 'error');
    }
  });

  // Master Toggle event
  masterToggle.addEventListener('change', () => {
    chrome.runtime.sendMessage({ action: 'TOGGLE_ENABLED' }, () => {
      loadDashboard();
    });
  });

  // Search input live filter
  searchInput.addEventListener('input', () => {
    renderTable();
  });

  // Export JSON
  btnExport.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentBlockedSites, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "blocked_sites.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  // Import JSON
  btnImportTrigger.addEventListener('click', () => {
    fileImport.click();
  });

  fileImport.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          let count = 0;
          for (const item of imported) {
            const dom = typeof item === 'string' ? item : item.domain;
            const norm = extractBaseDomain(dom);
            if (norm) {
              await new Promise(resolve => {
                chrome.runtime.sendMessage({ action: 'ADD_SITE', domain: norm }, resolve);
              });
              count++;
            }
          }
          showAlert(`Imported ${count} domains successfully`, 'success');
          loadDashboard();
        } else {
          showAlert('Invalid JSON format. Expected an array of domains.', 'error');
        }
      } catch (err) {
        showAlert('Failed to parse JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  });

  loadDashboard();
});
