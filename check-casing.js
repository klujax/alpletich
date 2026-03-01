import * as fs from 'fs';
import * as path from 'path';

function checkCasing(dir) {
    let files = fs.readdirSync(dir);
    for (let file of files) {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            checkCasing(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
            let match;
            while ((match = importRegex.exec(content)) !== null) {
                let importPath = match[1];
                if (importPath.startsWith('.') || importPath.startsWith('@/')) {
                    // We just log all internal imports for now.
                    // Actually, let's write a robust checker:
                }
            }
        }
    }
}
