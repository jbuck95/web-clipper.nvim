"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mathRules = exports.createCleanMathEl = exports.getLatexFromElement = void 0;
const mathml_to_latex_1 = require("mathml-to-latex");
const math_base_1 = require("./math.base");
const dom_1 = require("../utils/dom");
const getLatexFromElement = (el) => {
    // First try basic LaTeX extraction
    const basicLatex = (0, math_base_1.getBasicLatexFromElement)(el);
    if (basicLatex) {
        return basicLatex;
    }
    // If no LaTeX found but we have MathML, convert it
    const mathData = (0, math_base_1.getMathMLFromElement)(el);
    if (mathData?.mathml) {
        try {
            return mathml_to_latex_1.MathMLToLaTeX.convert(mathData.mathml);
        }
        catch (e) {
            console.warn('Failed to convert MathML to LaTeX:', e);
        }
    }
    return null;
};
exports.getLatexFromElement = getLatexFromElement;
const createCleanMathEl = (mathData, latex, isBlock, doc) => {
    const cleanMathEl = doc.createElement('math');
    cleanMathEl.setAttribute('xmlns', 'http://www.w3.org/1998/Math/MathML');
    cleanMathEl.setAttribute('display', isBlock ? 'block' : 'inline');
    cleanMathEl.setAttribute('data-latex', latex || '');
    // First try to use existing MathML content
    if (mathData?.mathml) {
        const fragment = (0, dom_1.parseHTML)(doc, mathData.mathml);
        const mathContent = fragment.querySelector('math');
        if (mathContent) {
            (0, dom_1.transferContent)(mathContent, cleanMathEl);
        }
    }
    // If no MathML but we have LaTeX, convert it
    else if (latex) {
        try {
            const temml = require('temml');
            const mathml = temml.renderToString(latex, {
                displayMode: isBlock,
                throwOnError: false
            });
            const fragment = (0, dom_1.parseHTML)(doc, mathml);
            const mathContent = fragment.querySelector('math');
            if (mathContent) {
                while (mathContent.firstChild) {
                    cleanMathEl.appendChild(mathContent.firstChild);
                }
            }
            else {
                cleanMathEl.textContent = latex; // Fallback to LaTeX as text
            }
        }
        catch (e) {
            console.warn('Failed to convert LaTeX to MathML:', e);
            cleanMathEl.textContent = latex; // Fallback to LaTeX as text
        }
    }
    return cleanMathEl;
};
exports.createCleanMathEl = createCleanMathEl;
exports.mathRules = [
    {
        selector: math_base_1.mathSelectors,
        element: 'math',
        fastCheck: math_base_1.mathFastCheck,
        transform: (el) => {
            if (!('classList' in el) || !('getAttribute' in el) || !('querySelector' in el)) {
                return el;
            }
            const mathData = (0, math_base_1.getMathMLFromElement)(el);
            const latex = (0, exports.getLatexFromElement)(el);
            const isBlock = (0, math_base_1.isBlockDisplay)(el);
            const cleanMathEl = (0, exports.createCleanMathEl)(mathData, latex, isBlock, el.ownerDocument);
            // Clean up any associated math scripts after we've extracted their content.
            // Skip when el itself is a math script — it will be replaced by the
            // caller, and removing siblings here would destroy unprocessed scripts.
            if (el.parentElement && !el.matches('script[type^="math/"]')) {
                const mathElements = el.parentElement.querySelectorAll('script[type^="math/"], .MathJax_Preview, script[type="text/javascript"][src*="mathjax"], script[type="text/javascript"][src*="katex"]');
                mathElements.forEach(el => el.remove());
            }
            return cleanMathEl;
        }
    }
];
//# sourceMappingURL=math.full.js.map