import Papa from 'papaparse';

export const REQUIRED_IMPORT_COLUMNS = Object.freeze([
  'Company Id',
  'Company Name',
  'Year',
  'Month',
  'Total Sales',
  'Paint Sales',
  'Paint Labour Costs',
  'Completed RO'
]);

export const MAX_IMPORT_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 5000;

const CSV_MIME_TYPE = 'text/csv';
const XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const fileExtension = (file) => {
  const name = String(file?.name || '').toLowerCase();
  if (name.endsWith('.xlsx')) return 'xlsx';
  if (name.endsWith('.csv')) return 'csv';
  if (file?.type === XLSX_MIME_TYPE) return 'xlsx';
  if (file?.type === CSV_MIME_TYPE) return 'csv';
  return '';
};

export const isSupportedAnalyticsImportFile = file => Boolean(fileExtension(file));

const normalizeHeader = value => String(value ?? '').replace(/^\uFEFF/, '').trim();
const hasValue = value => value !== null && value !== undefined && String(value).trim() !== '';

const normalizeObjectRows = rows => rows
  .filter(row => row && Object.values(row).some(hasValue))
  .map(row => {
    const normalized = {};
    Object.entries(row).forEach(([key, value]) => {
      const header = normalizeHeader(key);
      if (header) normalized[header] = value;
    });
    if (hasValue(normalized['Company Id'])) normalized['Company Id'] = String(normalized['Company Id']).trim();
    if (hasValue(normalized['Company Name'])) normalized['Company Name'] = String(normalized['Company Name']).trim();
    if (hasValue(normalized.State)) normalized.State = String(normalized.State).trim();
    return normalized;
  });

const sheetRowsToObjects = sheetRows => {
  if (!Array.isArray(sheetRows) || sheetRows.length === 0) return [];

  const headerRowIndex = sheetRows.findIndex(row => Array.isArray(row) && row.some(hasValue));
  if (headerRowIndex < 0) return [];

  const headers = sheetRows[headerRowIndex].map(normalizeHeader);
  const populatedHeaders = headers.filter(Boolean);
  const duplicateHeaders = populatedHeaders.filter((header, index) => populatedHeaders.indexOf(header) !== index);
  if (duplicateHeaders.length > 0) {
    throw new Error(`Duplicate column headings: ${[...new Set(duplicateHeaders)].join(', ')}`);
  }

  return sheetRows.slice(headerRowIndex + 1)
    .filter(row => Array.isArray(row) && row.some(hasValue))
    .map(row => headers.reduce((record, header, index) => {
      if (header) record[header] = row[index];
      return record;
    }, {}));
};

const parseCsv = file => new Promise((resolve, reject) => {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    transformHeader: normalizeHeader,
    complete: (results) => {
      if (results.errors?.length) {
        reject(new Error(`CSV parsing errors: ${results.errors.map(error => error.message).join('; ')}`));
        return;
      }
      resolve(results.data || []);
    },
    error: error => reject(new Error(`CSV parsing failed: ${error.message}`))
  });
});

const validateRows = rows => {
  if (rows.length === 0) throw new Error('The selected file does not contain any data rows.');
  if (rows.length > MAX_IMPORT_ROWS) throw new Error(`This file contains more than ${MAX_IMPORT_ROWS.toLocaleString()} rows. Split it into smaller imports and try again.`);

  const missingColumns = REQUIRED_IMPORT_COLUMNS.filter(column => !(column in rows[0]));
  if (missingColumns.length > 0) throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
};

export const parseAnalyticsImportFile = async (file) => {
  const extension = fileExtension(file);
  if (!extension) throw new Error('Choose a CSV or Excel (.xlsx) file.');
  if (file.size > MAX_IMPORT_FILE_SIZE) throw new Error('Choose a file smaller than 10 MB.');

  let rawRows;
  if (extension === 'xlsx') {
    const { readSheet } = await import('read-excel-file/browser');
    rawRows = sheetRowsToObjects(await readSheet(file));
  } else {
    rawRows = await parseCsv(file);
  }

  const rows = normalizeObjectRows(rawRows);
  validateRows(rows);
  return {
    rows,
    formatLabel: extension === 'xlsx' ? 'Excel' : 'CSV'
  };
};
