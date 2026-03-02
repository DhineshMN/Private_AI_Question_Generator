// =============================================
// CODING FEATURE HANDLERS
// renderCodingProblem(), attachCodingListeners(), runCode(), submitCode()
// =============================================

import { state } from '../../state/appState.js';
import { showPage } from '../../router/router.js';
import { showToast, showLoading, stopTimer } from '../../utils/ui.js';
import { buildTreeFromFiles } from '../../utils/treeUtils.js';

export function renderCodingProblem() {
    const p = state.problem;
    if (!p) return;

    const titleEl = document.getElementById('problem-title');
    if (titleEl) titleEl.textContent = p.title;

    const metaEl = document.getElementById('problem-meta');
    if (metaEl) {
        const diffColors = { Easy: 'badge-success', Medium: 'badge-warning', Hard: 'badge-danger' };
        metaEl.innerHTML = `
      <div style="display: flex; gap: 8px; align-items: center;">
        <span class="badge ${diffColors[p.difficulty] || 'badge-primary'}" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 12px;">${p.difficulty}</span>
        <button class="btn btn-secondary btn-sm" style="background: rgba(255,255,255,0.04); border: 1px solid var(--border); padding: 4px 10px; font-size: 0.75rem; border-radius: 12px; height: auto;">🏷️ Topics</button>
      </div>
    `;
    }

    const descriptionEl = document.getElementById('problem-description');
    if (descriptionEl) {
        let desc = p.description;
        if (typeof desc === 'object') {
            desc = desc.task || desc.objective || JSON.stringify(desc, null, 2);
        }
        descriptionEl.innerHTML = (desc || '')
            .replace(/`([^`]+)`/g, '<code class="code-span">$1</code>')
            .split('\n').map(line => line.trim() ? `<p style="margin-bottom: 20px; line-height: 1.6; color: #f1f5f9; font-size: 0.95rem;">${line}</p>` : '').join('');
    }

    const examplesEl = document.getElementById('problem-examples');
    if (examplesEl && p.examples && Array.isArray(p.examples)) {
        examplesEl.innerHTML = p.examples.map((ex, i) => `
      <div style="margin-bottom: 30px;">
        <p style="font-weight: 600; margin-bottom: 12px; font-size: 1rem; color: #fff;">Example ${i + 1}:</p>
        <div class="example-box" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); padding: 20px; border-radius: 8px;">
          <div style="margin-bottom: 8px;"><strong style="color: #94a3b8; font-family: var(--font-mono); font-size: 0.85rem; display: inline-block; width: 85px;">Input:</strong> <span style="font-family: var(--font-mono); color: #fff; font-size: 0.9rem;">${ex.input}</span></div>
          <div style="margin-bottom: 8px;"><strong style="color: #94a3b8; font-family: var(--font-mono); font-size: 0.85rem; display: inline-block; width: 85px;">Output:</strong> <span style="font-family: var(--font-mono); color: #fff; font-size: 0.9rem;">${ex.output}</span></div>
          ${ex.explanation ? `<div style="margin-top: 15px; font-size: 0.9rem; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px;"><strong style="color: #94a3b8; font-size: 0.85rem;">Explanation:</strong> ${ex.explanation}</div>` : ''}
        </div>
      </div>
    `).join('');
    }

    const constraintsContainer = document.getElementById('problem-constraints');
    if (constraintsContainer) {
        if (p.constraints && p.constraints.length) {
            constraintsContainer.innerHTML = `
        <p style="font-weight: 600; margin-bottom: 15px; font-size: 1rem; color: #fff;">Constraints:</p>
        <ul style="list-style: none; padding: 0; color: #94a3b8; font-size: 0.9rem;">
          ${p.constraints.map(c => `<li style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;"><span style="color: var(--primary); font-size: 0.8rem;">●</span> <code class="code-span" style="background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.1);">${c}</code></li>`).join('')}
        </ul>
      `;
        } else {
            constraintsContainer.innerHTML = '';
        }
    }

    const hintsContainer = document.getElementById('coding-hints-container');
    if (hintsContainer) {
        if (p.hints && p.hints.length) {
            hintsContainer.innerHTML = `
        <p style="font-weight: 600; margin: 30px 0 15px 0; font-size: 1rem; color: #fff;">💡 Hints:</p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${p.hints.map((hint, i) => `
            <div style="border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; overflow: hidden;">
              <div onclick="toggleHint(${i})" style="padding: 10px 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); font-size: 0.85rem; color: var(--primary-light); user-select: none;">
                <span>Hint ${i + 1}</span><span>▼</span>
              </div>
              <div id="hint-content-${i}" class="hint-content" style="display: none; padding: 12px 16px; font-size: 0.85rem; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.06); line-height: 1.5;">${hint}</div>
            </div>
          `).join('')}
        </div>`;
        } else {
            hintsContainer.innerHTML = '';
        }
    }

    const testGrid = document.getElementById('visible-test-grid');
    if (testGrid) {
        const visibleTests = (p.testCases || []).filter(t => !t.hidden);
        if (visibleTests.length) {
            state.selectedTestCaseIndex = 0;
            testGrid.innerHTML = `
        <p style="font-weight: 600; margin: 30px 0 15px 0; font-size: 1rem; color: #fff;">🧪 Test Cases:</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
          ${visibleTests.map((t, i) => `
            <div class="test-card${i === 0 ? ' active' : ''}" onclick="selectTestCase(${i})" style="padding: 6px 14px; border-radius: 6px; font-size: 0.78rem; cursor: pointer; border: 1px solid ${i === 0 ? 'var(--primary)' : 'var(--border)'}; background: ${i === 0 ? 'rgba(99,102,241,0.15)' : 'transparent'}; color: ${i === 0 ? 'var(--primary-light)' : 'var(--text-muted)'}; user-select: none; transition: all 0.2s;">
              Case ${i + 1}
            </div>
          `).join('')}
        </div>`;
        } else {
            testGrid.innerHTML = '';
        }
    }

    const structurePanel = document.getElementById('project-structure-panel');
    if (structurePanel) {
        const autoTree = (p.starterCode && typeof p.starterCode === 'object') ? buildTreeFromFiles(p.starterCode, p.title) : '';
        const treeContent = autoTree || p.projectStructure || '';
        if (treeContent) {
            structurePanel.style.display = 'block';
            structurePanel.innerHTML = `
        <p style="font-weight: 600; margin: 30px 0 15px 0; font-size: 1rem; color: #fff;">Project Structure:</p>
        <div class="editor-project-tree" style="background: rgba(13, 13, 26, 0.4); border: 1px solid var(--border); font-family: var(--font-mono); font-size: 0.85rem; padding: 20px; color: #a5b4fc; white-space: pre; overflow-x: auto; line-height: 1.5; border-radius: 8px;">${treeContent}</div>
      `;
        } else {
            structurePanel.style.display = 'none';
        }
    }

    const tabsContainer = document.getElementById('file-tabs-container');
    if (p.starterCode && typeof p.starterCode === 'object') {
        state.workingCode = { ...p.starterCode };
        const files = Object.keys(p.starterCode);
        state.activeFile = files.find(f => f.toLowerCase().includes('app') || f.toLowerCase().includes('solution') || f.toLowerCase().includes('main') || f.endsWith('.js') || f.endsWith('.py')) || files[0];

        if (tabsContainer) {
            tabsContainer.style.display = 'flex';
            tabsContainer.style.alignItems = 'center';
            tabsContainer.innerHTML = files.map(file => {
                const isActive = file === state.activeFile;
                return `
          <div class="file-tab" onclick="switchFile('${file}')" style="
            display: inline-flex; align-items: center; padding: 0 16px; height: 100%;
            font-family: var(--font-mono); font-size: 0.75rem; cursor: pointer;
            border-right: 1px solid var(--border);
            color: ${isActive ? 'var(--primary-light)' : 'var(--text-muted)'};
            background: ${isActive ? 'rgba(255,255,255,0.05)' : 'transparent'};
            transition: var(--transition);">
            📄 ${file}
          </div>
        `;
            }).join('');
        }
        document.getElementById('code-editor').value = state.workingCode[state.activeFile] || '';
    } else {
        if (tabsContainer) tabsContainer.style.display = 'none';
        document.getElementById('code-editor').value = p.starterCode || '';
        state.activeFile = null;
        state.workingCode = {};
    }

    document.getElementById('lang-select').value = state.language;
}

export function attachCodingListeners() {
    document.getElementById('lang-select').addEventListener('change', (e) => {
        state.language = e.target.value;
        const starter = typeof state.problem.starterCode === 'string' ? state.problem.starterCode : (state.problem.starterCode?.[state.language] || '');
        document.getElementById('code-editor').value = starter;
        showToast('info', `Switched to ${e.target.options[e.target.selectedIndex].text}`);
    });

    const editor = document.getElementById('code-editor');
    editor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const ta = e.target;
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            ta.value = ta.value.substring(0, start) + '    ' + ta.value.substring(end);
            ta.selectionStart = ta.selectionEnd = start + 4;
            if (state.activeFile) state.workingCode[state.activeFile] = ta.value;
        }
    });

    editor.addEventListener('input', (e) => {
        if (state.activeFile) {
            state.workingCode[state.activeFile] = e.target.value;
        }
    });

    document.getElementById('run-code-btn').addEventListener('click', runCode);
    document.getElementById('submit-code-btn').addEventListener('click', submitCode);

    const exitBtn = document.getElementById('coding-exit-btn');
    if (exitBtn) {
        exitBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to exit the test? Your progress will be lost.')) {
                stopTimer();
                showPage('home-page');
            }
        });
    }
}

export async function runCode() {
    const code = document.getElementById('code-editor').value.trim();
    const outputEl = document.getElementById('output-content');
    const p = state.problem;

    if (!code) {
        outputEl.className = 'output-content error';
        outputEl.textContent = '⚠ No code to run. Please write your solution first.';
        return;
    }

    if (!state.groqKey) {
        showToast('error', 'Groq API Key missing! Please add it in Admin Settings.');
        return;
    }

    outputEl.className = 'output-content';
    outputEl.textContent = '⏳ AI is executing your code...';

    try {
        const visibleTests = (p.testCases || []).filter(t => !t.hidden);
        const selectedTest = visibleTests[state.selectedTestCaseIndex] || { input: p.input, output: p.output };

        const prompt = `
      [EXECUTION ENVIRONMENT]
      Runtime: ${state.language}
      Goal: Solve "${p.title}"
      Input to Process: ${selectedTest.input}
      Expected Behavior: ${selectedTest.output}
      ${p.projectStructure ? `Architecture:\n${p.projectStructure}` : 'Single-file problem.'}
      Code to Execute (Current File):
      \`\`\`${state.language}
      ${code}
      \`\`\`
      [RULES]
      1. Return ONLY the literal output/console logs of this code. 
      2. If it fails, return ONLY the clear error message.
      3. No surrounding text. No explanation.
    `;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.groqKey}` },
            body: JSON.stringify({
                model: state.groqModel,
                messages: [{ role: 'system', content: 'You are a raw stdout stream. Output ONLY data.' }, { role: 'user', content: prompt }],
                temperature: 0.0
            })
        });

        if (!response.ok) throw new Error('AI Execution Service Down');
        const data = await response.json();
        const result = data.choices[0].message.content.trim();
        const isCorrect = result.toLowerCase().includes(selectedTest.output.toLowerCase());

        outputEl.className = `output-content ${isCorrect ? 'success' : 'error'}`;
        outputEl.innerHTML = `
      <div style="margin-bottom: 5px; font-weight: 700; color: ${isCorrect ? '#10b981' : '#ef4444'}">${isCorrect ? '✔ Passed' : '✖ Result Mismatch'}</div>
      <div style="font-family: monospace; opacity: 0.9;">${result}</div>
    `;
        showToast(isCorrect ? 'success' : 'info', isCorrect ? 'Test case passed!' : 'Result mismatch for selected input.');
    } catch (error) {
        console.error(error);
        outputEl.className = 'output-content error';
        outputEl.textContent = '❌ Execution Failed: ' + error.message;
        showToast('error', 'AI Compiler Error');
    }
}

export async function submitCode() {
    const code = document.getElementById('code-editor').value.trim();
    const p = state.problem;

    const isMultiFile = typeof p.starterCode === 'object';
    const isModified = isMultiFile ? true : (code !== p.starterCode && code !== (p.starterCode?.[state.language] || ''));

    if (!code || !isModified) {
        showToast('error', 'Please write or modify your solution before submitting!');
        return;
    }

    if (!state.groqKey) {
        showToast('error', 'Groq API Key missing! Check Settings.');
        return;
    }

    showLoading(true);
    const loadingText = document.querySelector('#loading-overlay .loading-text');
    if (loadingText) loadingText.textContent = "AI is evaluating your code...";

    try {
        const prompt = `
      Perform a deep technical evaluation of this code for the challenge: "${p.title}"
      [CONTEXT]
      Core Requirements: ${p.description}
      Visual Test Cases: ${JSON.stringify((p.testCases || []).filter(t => !t.hidden))}
      Hidden Edge Cases (Verify Internally): ${JSON.stringify((p.testCases || []).filter(t => t.hidden))}
      ${p.projectStructure ? `Full Project Structure:\n${p.projectStructure}` : 'Single standalone file.'}
      ${typeof p.starterCode === 'object' ? `Background Project Files: ${JSON.stringify(p.starterCode)}` : ''}
      [STUDENT SUBMISSION]
      \`\`\`${state.language}
      ${code}
      \`\`\`
      [OUTPUT FORMAT: JSON ONLY]
      {
        "passed": boolean,
        "score": number,
        "summary": "Brief result summary",
        "analysis": {
           "status": "Success/Failure reason",
           "optimizedApproach": "Describe the most efficient algorithm for this",
           "timeComplexity": "O(log n), O(n), etc.",
           "spaceComplexity": "O(1), O(n), etc.",
           "visualization": "Textual representation of the algorithm flow"
        },
        "feedback": "Expert feedback to student"
      }
    `;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.groqKey}` },
            body: JSON.stringify({
                model: state.groqModel,
                messages: [{ role: 'system', content: 'You are a senior technical interviewer and algorithm expert. You output JSON only.' }, { role: 'user', content: prompt }],
                temperature: 0.0,
                response_format: { type: 'json_object' }
            })
        });

        const data = await response.json();
        const evaluation = JSON.parse(data.choices[0].message.content);

        state.codingResults[state.currentQuestion] = evaluation.passed;
        state.codingHints[state.currentQuestion] = evaluation.analysis.optimizedApproach;

        showLoading(false);

        const { showAIAnalysisModal } = await import('../../components/AIAnalysisModal.js');
        showAIAnalysisModal(evaluation);

    } catch (error) {
        console.error(error);
        showLoading(false);
        showToast('error', 'Evaluation failed. Please try again.');
    } finally {
        if (loadingText) loadingText.textContent = "Generating your test...";
    }
}

// Global handlers for onclick attributes in dynamically generated HTML
window.switchFile = (filename) => {
    if (!state.activeFile || !state.workingCode) return;
    state.workingCode[state.activeFile] = document.getElementById('code-editor').value;
    state.activeFile = filename;
    document.getElementById('code-editor').value = state.workingCode[filename] || '';
    document.querySelectorAll('.file-tab').forEach(tab => {
        const isMatched = tab.textContent.trim().includes(filename);
        tab.style.color = isMatched ? 'var(--primary-light)' : 'var(--text-muted)';
        tab.style.background = isMatched ? 'rgba(255,255,255,0.05)' : 'transparent';
    });
    showToast('info', `Switched to: ${filename}`);
};

window.toggleHint = (idx) => {
    const content = document.getElementById(`hint-content-${idx}`);
    if (content) content.style.display = content.style.display === 'none' ? 'block' : 'none';
};

window.selectTestCase = (idx) => {
    state.selectedTestCaseIndex = idx;
    document.querySelectorAll('.test-card').forEach((c, i) => {
        c.classList.toggle('active', i === idx);
    });
    const p = state.problem;
    const visibleTests = (p.testCases || []).filter(t => !t.hidden);
    const test = visibleTests[idx];
    if (test) {
        const output = document.getElementById('output-content');
        output.innerHTML = `
      <div style="margin-bottom: 10px; opacity: 0.7; font-size: 0.8rem;">Selected Test Case ${idx + 1}:</div>
      <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; font-family: monospace;">
        <div><span style="color: var(--primary-light)">Input:</span> ${test.input}</div>
        <div><span style="color: var(--primary-light)">Expected:</span> ${test.output}</div>
      </div>
    `;
    }
};
