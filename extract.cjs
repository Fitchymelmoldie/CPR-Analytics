const fs = require('fs');
const path = require('path');

const backupPath = path.resolve(__dirname, '../bodyshop-dashboard - Copy 1/index.html');
const appJsxPath = path.resolve(__dirname, 'src/App.jsx');
const indexCssPath = path.resolve(__dirname, 'src/index.css');

const htmlContent = fs.readFileSync(backupPath, 'utf-8');

// Extract JS
const jsMatch = htmlContent.match(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/);
let jsContent = jsMatch ? jsMatch[1] : '';

// Remove ReactDOM.render and replace with export default App
jsContent = jsContent.replace(/const root = ReactDOM\.createRoot[\s\S]*?\);/, 'export default App;');
jsContent = jsContent.replace(/ReactDOM\.render[\s\S]*?\);/, 'export default App;');

// Add imports at top
const imports = `import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Chart } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';
import Papa from 'papaparse';
Chart.register(ChartDataLabels, annotationPlugin);
`;

jsContent = imports + jsContent;

// Fix standard React destructuring since we imported them
jsContent = jsContent.replace(/const\s+{\s*useState,\s*useEffect,\s*useMemo,\s*useRef,\s*useCallback\s*}\s*=\s*React;/g, '');

fs.writeFileSync(appJsxPath, jsContent);

// Extract CSS
const cssMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
let cssContent = cssMatch ? cssMatch[1] : '';
const fullCss = `@import "tailwindcss";\n` + cssContent;
fs.writeFileSync(indexCssPath, fullCss);

console.log('Extraction complete! App.jsx and index.css have been populated from the backup.');
