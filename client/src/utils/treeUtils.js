// =============================================
// TREE UTILS — buildTreeFromFiles(), renderNode()
// Converts a starterCode object into an ASCII project tree.
// =============================================

/**
 * Builds an ASCII tree string from a starterCode file-path map.
 * @param {Object} starterCode - Keys are file paths like "src/app/app.ts"
 * @param {string} rootName - Root folder label
 * @returns {string} ASCII tree representation
 */
export function buildTreeFromFiles(starterCode, rootName = '.') {
    if (!starterCode || typeof starterCode !== 'object') return '';
    const files = Object.keys(starterCode);
    if (files.length === 0) return '';

    const root = {};
    files.forEach(filePath => {
        const parts = filePath.split('/');
        let current = root;
        parts.forEach((part, idx) => {
            if (!current[part]) {
                current[part] = (idx === parts.length - 1) ? null : {};
            }
            if (current[part] !== null) {
                current = current[part];
            }
        });
    });

    function renderNode(node, prefix) {
        const entries = Object.keys(node).sort((a, b) => {
            const aIsDir = node[a] !== null;
            const bIsDir = node[b] !== null;
            if (aIsDir && !bIsDir) return -1;
            if (!aIsDir && bIsDir) return 1;
            return a.localeCompare(b);
        });
        let result = '';
        entries.forEach((key, idx) => {
            const isLast = idx === entries.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            const childPrefix = isLast ? '    ' : '│   ';
            result += prefix + connector + key + '\n';
            if (node[key] !== null) {
                result += renderNode(node[key], prefix + childPrefix);
            }
        });
        return result;
    }

    const cleanRootName = (rootName || '.').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return cleanRootName + '\n' + renderNode(root, '');
}
