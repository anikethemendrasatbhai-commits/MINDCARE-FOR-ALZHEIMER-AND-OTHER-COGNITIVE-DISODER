const state = { history: [], minutes: 0, activity: null };

const pages = {
  home: 'Overview',
  tests: 'Cognitive tests',
  activities: 'Memory activities',
  history: 'My history',
  reports: 'Results & reports',
  learn: 'Learn & support'
};

function go(page) {
  if (!pages[page]) return;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');

  document.querySelectorAll('.nav button').forEach(b =>
    b.classList.toggle('active', b.dataset.page === page)
  );

  document.getElementById('crumb').textContent = pages[page];
  document.getElementById('sidebar').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (page === 'history') renderHistory();
  if (page === 'reports') renderReports();
}

document.querySelectorAll('[data-page]').forEach(b =>
  b.addEventListener('click', () => go(b.dataset.page))
);

document.querySelectorAll('[data-go]').forEach(b =>
  b.addEventListener('click', () => go(b.dataset.go))
);

document.getElementById('menuBtn').addEventListener('click', () =>
  document.getElementById('sidebar').classList.toggle('open')
);

const toastEl = document.getElementById('toast');
let toastTimer;

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
}

const modalBackdrop = document.getElementById('modalBackdrop');

function showModal(title, body, eyebrow = 'Learn more') {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalEyebrow').textContent = eyebrow;
  document.getElementById('modalBody').innerHTML = body;
  modalBackdrop.classList.add('open');
}

function closeModal() {
  modalBackdrop.classList.remove('open');
}

document.getElementById('closeModal').onclick = closeModal;
document.getElementById('modalDone').onclick = closeModal;

modalBackdrop.addEventListener('click', e => {
  if (e.target === modalBackdrop) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    document.getElementById('sidebar').classList.remove('open');
  }
});

function learn(key) {
  const content = {
    moca: [
      'Montreal Cognitive Assessment (MoCA)',
      'The MoCA is a brief cognitive screening instrument used by trained professionals to help identify possible cognitive concerns. It looks across several areas of thinking, such as attention, memory, language and visuospatial skills. It does not diagnose Alzheimer’s disease on its own. Official materials, training and use permissions may be required; this demo does not reproduce the test or calculate a MoCA score.'
    ],
    mmse: [
      'Mini-Mental State Examination (MMSE)',
      'The MMSE is a widely known brief cognitive screening instrument used in clinical settings. It samples areas such as orientation, recall, attention and language. Results need to be interpreted in context by a qualified professional and cannot independently diagnose a condition. This student demo provides background information only and does not reproduce official MMSE questions or scoring.'
    ]
  };

  const c = content[key];

  if (c) {
    showModal(
      c[0],
      '<p>' + c[1] + '</p>' +
      '<div class="disclaimer"><span>ⓘ</span><div>For educational purposes only. If you are concerned about memory or thinking changes, please speak with a qualified healthcare professional.</div></div>',
      'Clinical tool overview'
    );
  }
}

document.querySelectorAll('[data-learn]').forEach(b =>
  b.addEventListener('click', () => learn(b.dataset.learn))
);

document.getElementById('helpBtn').addEventListener('click', () =>
  showModal(
    'How to use MindCare Assess',
    '<p>Choose an activity, follow the instructions, and review your session history if you wish. This demo stores activity results only in the current browser session.</p>' +
    '<p><b>Remember:</b> scores from these activities are not medical measurements. They cannot diagnose or rule out Alzheimer’s disease or any other condition.</p>',
    'Quick help'
  )
);

document.querySelectorAll('[data-open-contact]').forEach(b =>
  b.addEventListener('click', () =>
    showModal(
      'Questions for a healthcare professional',
      '<p>You can use these prompts to prepare for a conversation:</p>' +
      '<ul style="font-size:12px;line-height:1.8;color:#53685f;padding-left:19px">' +
      '<li>When did I first notice the change?</li>' +
      '<li>Does it affect everyday tasks?</li>' +
      '<li>Have sleep, stress, mood or medicines changed?</li>' +
      '<li>What evaluation or follow-up would you recommend?</li>' +
      '</ul><p>Bring a trusted person if that would make the conversation easier.</p>',
      'Support guide'
    )
  )
);

function startMemory() {
  go('activities');
  state.activity = 'memory';

  const stage = document.getElementById('activityStage');

  stage.innerHTML = `
    <div class="eyebrow">Word garden · Step 1 of 2</div>
    <div class="stage-progress"><span style="width:50%"></span></div>

    <div class="stage-center">
      <div class="big-emoji">🌷</div>
      <h3>Take a moment to remember</h3>

      <p>Look at these six everyday words. When you’re ready, hide them and type in as many as you remember. This is just a learning activity—there is no pass or fail.</p>

      <div class="word-grid">
        <span class="word-chip">River</span>
        <span class="word-chip">Candle</span>
        <span class="word-chip">Apple</span>
        <span class="word-chip">Window</span>
        <span class="word-chip">Garden</span>
        <span class="word-chip">Paper</span>
      </div>

      <div class="stage-actions">
        <button class="btn" id="hideWords">I’m ready</button>
        <button class="btn secondary" id="cancelActivity">Cancel</button>
      </div>
    </div>
  `;

  document.getElementById('hideWords').onclick = () => {
    stage.innerHTML = `
      <div class="eyebrow">Word garden · Step 2 of 2</div>
      <div class="stage-progress"><span style="width:80%"></span></div>

      <div class="stage-center">
        <div class="big-emoji">🌱</div>
        <h3>Which words do you remember?</h3>

        <p>Type any words you recall, separated by commas. Spelling does not need to be perfect.</p>

        <input class="word-input" id="recallInput"
          placeholder="e.g. apple, river, ..."
          aria-label="Words you remember">

        <div class="stage-actions" style="margin-top:16px">
          <button class="btn" id="submitRecall">Finish activity</button>
          <button class="btn secondary" id="cancelActivity">Cancel</button>
        </div>

        <div class="result-box" id="memoryResult"></div>
      </div>
    `;

    document.getElementById('submitRecall').onclick = () => {
      const words = ['river', 'candle', 'apple', 'window', 'garden', 'paper'];

      const input = document.getElementById('recallInput')
        .value.toLowerCase()
        .split(/[,\s]+/)
        .filter(Boolean);

      const found = [...new Set(input.filter(w => words.includes(w)))];
      const box = document.getElementById('memoryResult');

      box.style.display = 'block';

      box.innerHTML = `
        <b>Thanks for giving it a try 🌿</b><br>
        You recalled ${found.length} of the six words in this activity.
        The words were River, Candle, Apple, Window, Garden and Paper.

        <br><br>
        <span style="font-size:10px">
          This result is not a clinical score and does not measure your overall memory or health.
        </span>

        <br><br>
        <button class="btn small" id="saveMemory">Save to session history</button>
        <button class="btn secondary small" id="againMemory">Try again</button>
      `;

      document.getElementById('saveMemory').onclick = () => {
        saveActivity(
          'Word garden',
          'Memory & recall',
          found.length + ' of 6 words recalled',
          2
        );

        stage.innerHTML = `
          <div class="stage-center">
            <div class="big-emoji">🌿</div>
            <h3>Nice work showing up.</h3>

            <p>You completed the Word Garden activity. Remember, one short exercise can’t tell the whole story about your memory.</p>

            <button class="btn" onclick="go('history')">View my history</button>
            <button class="btn secondary" onclick="startMemory()">Try again</button>
          </div>
        `;
      };

      document.getElementById('againMemory').onclick = startMemory;
    };

    document.getElementById('cancelActivity').onclick = resetStage;
  };

  document.getElementById('cancelActivity').onclick = resetStage;
}

function startFocus() {
  go('activities');
  state.activity = 'attention';

  const stage = document.getElementById('activityStage');

  const symbols = Array.from({ length: 24 }, (_, i) =>
    i === 3 || i === 9 || i === 17
      ? '●'
      : ['○', '◌', '◍', '◉'][Math.floor(Math.random() * 4)]
  );

  symbols[3] = '●';
  symbols[9] = '●';
  symbols[17] = '●';

  stage.innerHTML = `
    <div class="eyebrow">Focus finder · Quick challenge</div>
    <div class="stage-progress"><span style="width:45%"></span></div>

    <div class="stage-center">
      <div class="big-emoji">🎯</div>
      <h3>Find the solid circles</h3>

      <p>Tap every solid circle (●) in the grid. Ignore the hollow and patterned circles. There are three targets.</p>

      <div class="word-grid" id="focusGrid"
        style="max-width:450px;margin:20px auto">
        ${symbols.map((s, i) =>
          `<button class="word-chip" data-symbol-index="${i}"
            style="min-width:54px;padding:14px 12px">${s}</button>`
        ).join('')}
      </div>

      <p id="focusFeedback" aria-live="polite">0 of 3 targets found</p>

      <div class="stage-actions">
        <button class="btn" id="finishFocus">Finish activity</button>
        <button class="btn secondary" id="cancelActivity">Cancel</button>
      </div>

      <div class="result-box" id="focusResult"></div>
    </div>
  `;

  let found = new Set();

  document.querySelectorAll('[data-symbol-index]').forEach(b => {
    b.onclick = () => {
      const i = +b.dataset.symbolIndex;

      if (symbols[i] === '●') {
        b.style.background = '#dcefe6';
        b.style.borderColor = '#74a78b';
        found.add(i);

        document.getElementById('focusFeedback').textContent =
          found.size + ' of 3 targets found';
      } else {
        b.style.background = '#fbe2d9';
        setTimeout(() => b.style.background = '', 450);
      }
    };
  });

  document.getElementById('finishFocus').onclick = () => {
    const box = document.getElementById('focusResult');

    box.style.display = 'block';

    box.innerHTML = `
      You found ${found.size} of 3 targets in this grid.
      This is a casual attention puzzle, not a validated attention test.

      <br><br>
      <button class="btn small" id="saveFocus">Save to session history</button>
    `;

    document.getElementById('saveFocus').onclick = () => {
      saveActivity(
        'Focus finder',
        'Attention',
        found.size + ' of 3 targets found',
        2
      );

      resetStage();
      toast('Activity saved to this session');
    };
  };

  document.getElementById('cancelActivity').onclick = resetStage;
}

function startPattern() {
  go('activities');
  state.activity = 'reasoning';

  const stage = document.getElementById('activityStage');

  stage.innerHTML = `
    <div class="eyebrow">Pattern path · One question</div>
    <div class="stage-progress"><span style="width:55%"></span></div>

    <div class="stage-center">
      <div class="big-emoji">🔷</div>
      <h3>What comes next?</h3>

      <p>Look at the pattern and choose the shape that should follow.</p>

      <div class="word-grid">
        <span class="word-chip" style="font-size:25px">○</span>
        <span class="word-chip" style="font-size:25px">△</span>
        <span class="word-chip" style="font-size:25px">○</span>
        <span class="word-chip" style="font-size:25px">△</span>
        <span class="word-chip" style="font-size:25px">?</span>
      </div>

      <div class="stage-actions">
        <button class="btn secondary pattern-answer" data-answer="circle">○ Circle</button>
        <button class="btn secondary pattern-answer" data-answer="triangle">△ Triangle</button>
      </div>

      <div class="result-box" id="patternResult"></div>
    </div>
  `;

  document.querySelectorAll('.pattern-answer').forEach(b => {
    b.onclick = () => {
      const box = document.getElementById('patternResult');

      box.style.display = 'block';

      box.innerHTML =
        (b.dataset.answer === 'circle'
          ? 'That’s right—the pattern alternates circle, triangle.'
          : 'Good try! This pattern alternates circle, triangle, so a circle comes next.') +
        '<br><br>This is a simple learning puzzle, not a clinical measure.' +
        '<br><br><button class="btn small" id="savePattern">Save activity</button>';

      document.querySelectorAll('.pattern-answer').forEach(x => {
        x.disabled = true;
      });

      document.getElementById('savePattern').onclick = () => {
        saveActivity(
          'Pattern path',
          'Reasoning',
          b.dataset.answer === 'circle'
            ? 'Pattern identified'
            : 'Pattern reviewed',
          1
        );

        resetStage();
        toast('Activity saved to this session');
      };
    };
  });
}

function resetStage() {
  const stage = document.getElementById('activityStage');

  stage.innerHTML = `
    <div class="eyebrow">Your activity space</div>

    <div class="stage-center">
      <div class="big-emoji">🌱</div>
      <h3>A little brain break?</h3>

      <p>Choose an activity above. Each one is an original educational exercise created for this demo. Your activity results stay in this browser session only.</p>

      <button class="btn" data-start-memory>Start Word Garden</button>
    </div>
  `;

  stage.querySelector('[data-start-memory]').onclick = startMemory;
}

function saveActivity(name, category, result, mins) {
  state.history.unshift({
    name,
    category,
    result,
    mins,
    date: new Date().toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  });

  state.minutes += mins;

  updateStats();
  renderHistory();
  renderReports();
}

function updateStats() {
  document.getElementById('completedCount').textContent = state.history.length;
  document.getElementById('minutesCount').textContent = state.minutes + ' min';

  document.getElementById('streakCount').textContent =
    state.history.length ? 'Showing up' : 'Just starting';

  document.getElementById('reportCount').textContent = state.history.length;
  document.getElementById('reportMinutes').textContent = state.minutes + ' min';
}

function renderHistory() {
  const el = document.getElementById('historyContent');

  if (!state.history.length) {
    el.innerHTML = `
      <div class="empty-state">
        🌿<br><br>
        No activities yet.<br>
        Try a memory activity to start your history.
      </div>
    `;
    return;
  }

  el.innerHTML = `
    <div style="overflow:auto">
      <table class="history-table">
        <thead>
          <tr>
            <th>Activity</th>
            <th>Category</th>
            <th>Result</th>
            <th>When</th>
          </tr>
        </thead>

        <tbody>
          ${state.history.map(h => `
            <tr>
              <td><b>${escapeHtml(h.name)}</b></td>
              <td>${escapeHtml(h.category)}</td>
              <td>${escapeHtml(h.result)}</td>
              <td>${escapeHtml(h.date)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderReports() {
  const el = document.getElementById('reportList');

  if (!state.history.length) {
    el.className = 'empty-state';
    el.innerHTML = 'Complete an activity to see your session summary here.';
    return;
  }

  el.className = '';

  el.innerHTML = `
    <div class="test-list">
      ${state.history.map(h => `
        <div class="test-row">
          <div class="test-symbol">✳</div>

          <div class="test-info">
            <strong>${escapeHtml(h.name)}</strong>
            <small>${escapeHtml(h.category)} · ${escapeHtml(h.result)}</small>
          </div>

          <span class="badge">${h.mins} min</span>
        </div>
      `).join('')}
    </div>
  `;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

document.getElementById('clearHistory').onclick = () => {
  if (!state.history.length) {
    toast('Your session history is already empty');
    return;
  }

  showModal(
    'Clear session history?',
    '<p>This removes the activities you completed in this browser session. This cannot be undone.</p>' +
    '<div class="stage-actions">' +
    '<button class="btn secondary" id="keepHistory">Keep history</button>' +
    '<button class="btn" id="confirmClear">Clear history</button>' +
    '</div>',
    'Confirm action'
  );

  document.getElementById('keepHistory').onclick = closeModal;

  document.getElementById('confirmClear').onclick = () => {
    state.history = [];
    state.minutes = 0;

    updateStats();
    renderHistory();
    renderReports();
    closeModal();

    toast('Session history cleared');
  };
};

document.getElementById('downloadReport').onclick = () => {
  if (!state.history.length) {
    toast('Complete an activity before exporting a summary');
    return;
  }

  const lines = [
    'MindCare Assess — Demo Session Summary',
    'For educational purposes only; not a clinical report.',
    'Activities completed: ' + state.history.length,
    'Estimated minutes: ' + state.minutes,
    '',
    'Activity | Category | Result | Time',
    ...state.history.map(h =>
      [h.name, h.category, h.result, h.date].join(' | ')
    ),
    '',
    'These original educational activities are not validated medical measurements and cannot diagnose or rule out a health condition.'
  ];

  const blob = new Blob([lines.join('\n')], {
    type: 'text/plain;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = 'mindcare-session-summary.txt';
  a.click();

  URL.revokeObjectURL(url);
  toast('Session summary exported');
};

document.querySelectorAll('[data-start-memory]').forEach(b =>
  b.addEventListener('click', startMemory)
);

document.querySelectorAll('[data-start-focus]').forEach(b =>
  b.addEventListener('click', startFocus)
);

document.querySelectorAll('[data-start-pattern]').forEach(b =>
  b.addEventListener('click', startPattern)
);

document.querySelectorAll('[data-filter]').forEach(b =>
  b.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(x =>
      x.classList.toggle('active', x === b)
    );

    document.querySelectorAll('#activityCards [data-kind]').forEach(card => {
      card.style.display =
        b.dataset.filter === 'all' || card.dataset.kind === b.dataset.filter
          ? 'flex'
          : 'none';
    });
  })
);

document.querySelectorAll('.test-row[role="button"]').forEach(el => {
  el.addEventListener('click', () => go('activities'));

  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      go('activities');
    }
  });
});

const now = new Date();

document.getElementById('dateLabel').textContent =
  now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }) + ' · Take it at your pace';

resetStage();
updateStats();
