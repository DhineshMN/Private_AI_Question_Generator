// =============================================
// EXPORT UTILS — downloadQuestions(), downloadAsZip()
// =============================================

import { buildTreeFromFiles } from './treeUtils.js';
import { showToast } from './ui.js';

export function downloadQuestions(questions, type, format) {
    const timestamp = new Date().toISOString().slice(0, 10);
    const subtopic = questions[0]?.subtopic || questions[0]?.title || 'questions';
    const safeFilename = `${subtopic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp}`;

    if (format === 'json') {
        const blob = new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${safeFilename}.json`;
        a.click(); URL.revokeObjectURL(url);
        showToast('success', 'Downloaded as JSON!');
        return;
    }

    let md = `# Question Bank — ${subtopic}\n`;
    md += `**Type:** ${type.toUpperCase()} | **Generated:** ${new Date().toLocaleDateString()}\n\n---\n\n`;

    questions.forEach((q, i) => {
        if (type === 'mcq') {
            md += `## Q${i + 1}. ${q.question}\n\n`;
            md += `**Difficulty:** ${q.difficulty || 'N/A'}\n\n`;
            (q.options || []).forEach((opt, idx) => {
                const marker = idx === q.correct ? '✅' : '⬜';
                md += `${marker} **${String.fromCharCode(65 + idx)}.** ${opt}\n`;
            });
            if (q.explanation) md += `\n> **Explanation:** ${q.explanation}\n`;
            md += `\n---\n\n`;
        } else {
            md += `## ${i + 1}. ${q.title}\n\n`;
            md += `**Difficulty:** ${q.difficulty || 'N/A'} | **Time Limit:** ${q.timeLimit || '45'} mins\n\n`;
            md += `### 📋 Description\n${q.description}\n\n`;
            const exportTree = (q.starterCode && typeof q.starterCode === 'object') ? buildTreeFromFiles(q.starterCode) : q.projectStructure;
            if (exportTree) md += `### 📁 Project Structure\n\`\`\`\n${exportTree}\n\`\`\`\n\n`;
            if (q.starterCode) {
                if (typeof q.starterCode === 'object') {
                    md += `### 💻 Project Starter Code\n\n`;
                    Object.entries(q.starterCode).forEach(([filename, code]) => {
                        const ext = filename.split('.').pop();
                        const langMap = { js: 'javascript', jsx: 'jsx', ts: 'typescript', json: 'json', py: 'python', html: 'html', css: 'css' };
                        md += `#### 📄 \`${filename}\`\n\n\`\`\`${langMap[ext] || ext}\n${code}\n\`\`\`\n\n`;
                    });
                } else {
                    md += `### 💻 Starter Code\n\n\`\`\`\n${q.starterCode}\n\`\`\`\n\n`;
                }
            }
            md += `### 📥 Input Format\n${q.input || 'N/A'}\n\n### 📤 Output Format\n${q.output || 'N/A'}\n\n`;
            if (q.constraints && q.constraints.length) { md += `### ⚙️ Constraints\n`; q.constraints.forEach(c => { md += `- ${c}\n`; }); md += '\n'; }
            if (q.hints && q.hints.length) { md += `### 💡 Hints\n`; q.hints.forEach((h, idx) => { md += `${idx + 1}. ${h}\n`; }); md += '\n'; }
            if (q.testCases && q.testCases.length) {
                md += `### 🧪 Test Case Suite\n\n| Case | Input | Output | Access |\n| :--- | :--- | :--- | :--- |\n`;
                q.testCases.forEach((tc, idx) => { md += `| ${idx + 1} | \`${tc.input}\` | \`${tc.output}\` | ${tc.hidden ? '🔒 Hidden' : '👁️ Visible'} |\n`; });
                md += '\n';
            }
            md += `---\n\n`;
        }
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${safeFilename}.md`;
    a.click(); URL.revokeObjectURL(url);
    showToast('success', 'Downloaded as Markdown!');
}

export async function downloadAsZip(q) {
    if (typeof JSZip === 'undefined') {
        showToast('error', 'ZIP generator not ready. Refreshing page might help.');
        return;
    }

    const zip = new JSZip();
    const topFolderName = (q.title || q.subtopic || 'coding_export').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const topFolder = zip.folder(topFolderName);

    const generateQuestionFolder = (folder, question, index) => {
        let readme = `# ${question.title || question.subtopic || 'Question ' + index}\n\n`;
        if (question.type === 'mcq') {
            readme += `## Question\n${question.question}\n\n`;
            if (question.options) { question.options.forEach((opt, i) => { const marker = i === question.correct ? '✅' : '⬜'; readme += `${marker} **${String.fromCharCode(65 + i)}.** ${opt}\n`; }); }
            if (question.explanation) readme += `\n> **Explanation:** ${question.explanation}\n`;
        } else {
            readme += `## Challenge Description\n${question.description || ''}\n\n`;
            readme += `### Input Format\n${question.input || 'N/A'}\n\n### Output Format\n${question.output || 'N/A'}\n\n`;
            if (question.constraints && question.constraints.length) { readme += '### Constraints\n'; question.constraints.forEach(c => readme += `- ${c}\n`); readme += '\n'; }
            if (question.hints && question.hints.length) { readme += '### Hints\n'; question.hints.forEach((h, i) => readme += `${i + 1}. ${h}\n`); readme += '\n'; }
        }
        folder.file("README.md", readme);
        if (question.type !== 'mcq' && question.examples && question.examples.length) {
            let exMd = `# Examples\n\n`;
            question.examples.forEach((ex, i) => { exMd += `### Example ${i + 1}\n**Input:** \`${ex.input}\`  \n**Output:** \`${ex.output}\`  \n**Explanation:** ${ex.explanation || 'N/A'}\n\n`; });
            folder.file("EXAMPLES.md", exMd);
        }
        if (question.type !== 'mcq' && question.starterCode) {
            if (typeof question.starterCode === 'object') {
                Object.entries(question.starterCode).forEach(([filename, code]) => { folder.file(filename, code); });
            } else {
                const extMap = { python: 'py', javascript: 'js', java: 'java', cpp: 'cpp', sql: 'sql', php: 'php', c: 'c' };
                const topic = (question.subtopic || '').toLowerCase();
                let ext = 'txt';
                for (const [key, val] of Object.entries(extMap)) { if (topic.includes(key)) { ext = val; break; } }
                folder.file(`solution.${ext}`, question.starterCode || '');
            }
        }
    };

    if (q.exportedQuestions && Array.isArray(q.exportedQuestions)) {
        q.exportedQuestions.forEach((question, idx) => {
            const subFolderName = `Q${idx + 1}_${(question.title || question.subtopic || 'question').replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
            const subFolder = topFolder.folder(subFolderName);
            generateQuestionFolder(subFolder, question, idx + 1);
        });
    } else {
        generateQuestionFolder(topFolder, q, 1);
    }

    try {
        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${topFolderName}.zip`;
        a.click(); URL.revokeObjectURL(url);
        showToast('success', 'Project ZIP generated and downloaded!');
    } catch (err) {
        showToast('error', 'Failed to generate ZIP');
        console.error(err);
    }
}
