// Utility functions to help convert Notion data to ProFlow task format

export interface NotionTaskRow {
  [key: string]: any;
}

export interface ProFlowTask {
  projectName: string;
  pages: number;
  rate: number;
  workStatus: 'Pending' | 'In Progress' | 'Completed';
  paymentStatus: 'Paid' | 'Unpaid' | 'Partially Paid';
  notes?: string;
  acceptedDate?: string;
  submissionDate?: string;
  isValid?: boolean;
  originalIndex?: number;
  rawData?: any;
}

/**
 * Convert Notion CSV/JSON data to ProFlow task format
 * This function helps map common Notion field names to ProFlow format
 */
export function convertNotionToProFlow(notionData: NotionTaskRow[], defaultRate: number = 100, defaultPaymentStatus: 'Paid' | 'Unpaid' | 'Partially Paid' = 'Unpaid'): ProFlowTask[] {
  console.log('Converting Notion data:', notionData);

  return notionData.map((row, index) => {
    console.log(`Processing row ${index + 1}:`, row);

    // Common field mappings - adjust these based on your Notion column names
    const projectName =
      row.projectName ||
      row['Project Name'] ||
      row['project name'] ||
      row.project ||
      row.title ||
      row.Title ||
      row.name ||
      row.Name ||
      row['Task Name'] ||
      row['task name'] ||
      `Project ${index + 1}`;

    const pages =
      parseInt(row.pages || row.Pages || row.page_count || row['Page Count'] || row['page count'] || '1');

    const rate =
      parseFloat(row.rate || row.Rate || row.price || row.Price || row.cost || row.Cost || defaultRate.toString());

    console.log(`Mapped values - Project: "${projectName}", Pages: ${pages}, Rate: ${rate}`);

    // Validate if this looks like a valid task
    const isValid = isValidTask(projectName, pages, rate, row);
    console.log(`Task validation - Valid: ${isValid}`);

    // Map status values
    let workStatus: 'Pending' | 'In Progress' | 'Completed' = 'Pending';
    const statusValue = (row.status || row.Status || row.workStatus || '').toLowerCase();
    
    if (statusValue.includes('progress') || statusValue.includes('working') || statusValue.includes('active')) {
      workStatus = 'In Progress';
    } else if (statusValue.includes('complete') || statusValue.includes('done') || statusValue.includes('finished')) {
      workStatus = 'Completed';
    }

    // Map payment status
    let paymentStatus: 'Paid' | 'Unpaid' | 'Partially Paid' = defaultPaymentStatus;
    const paymentValue = (row.paymentStatus || row['Payment Status'] || row.payment || row.Payment || '').toLowerCase();

    if (paymentValue.includes('paid') && !paymentValue.includes('unpaid')) {
      if (paymentValue.includes('partial') || paymentValue.includes('part')) {
        paymentStatus = 'Partially Paid';
      } else {
        paymentStatus = 'Paid';
      }
    } else if (paymentValue.includes('unpaid')) {
      paymentStatus = 'Unpaid';
    }

    const notes =
      row.notes ||
      row.Notes ||
      row.description ||
      row.Description ||
      row.details ||
      '';

    // Date handling
    const acceptedDate = formatDate(
      row.acceptedDate || 
      row['Accepted Date'] || 
      row.startDate || 
      row['Start Date'] || 
      row.created || 
      new Date().toISOString()
    );

    const submissionDate = formatDate(
      row.submissionDate || 
      row['Submission Date'] || 
      row.dueDate || 
      row['Due Date'] || 
      row.deadline || 
      new Date(new Date().setDate(new Date().getDate() + 14)).toISOString()
    );

    return {
      projectName,
      pages: isNaN(pages) ? 1 : pages,
      rate: isNaN(rate) ? defaultRate : rate,
      workStatus,
      paymentStatus,
      notes,
      acceptedDate,
      submissionDate,
      isValid,
      originalIndex: index,
      rawData: row,
    };
  });
}

/**
 * Validate if a row looks like a valid task
 */
function isValidTask(projectName: string, pages: number, rate: number, rawRow: any): boolean {
  // Check for empty or whitespace-only project names
  if (!projectName || !projectName.trim()) {
    console.log(`Rejected: Empty project name`);
    return false;
  }

  const projectTrimmed = projectName.trim();
  const projectLower = projectTrimmed.toLowerCase();

  // Skip rows that look like totals, amounts, or summaries
  const invalidPatterns = [
    'total', 'sum', 'amount received', 'amount paid', 'balance', 'subtotal',
    'grand total', 'payment', 'invoice', 'receipt', 'summary', 'notes',
    'remarks', 'footer', 'header', 'title row', 'description', 'details',
    'project name', 'task name', 'name', 'title' // Skip header-like entries
  ];

  if (invalidPatterns.some(pattern => projectLower.includes(pattern))) {
    console.log(`Rejected: "${projectTrimmed}" matches invalid pattern`);
    return false;
  }

  // Check if it's just a number (like "720")
  if (/^\d+(\.\d+)?$/.test(projectTrimmed)) {
    console.log(`Rejected: "${projectTrimmed}" is just a number`);
    return false;
  }

  // Check if it's just symbols or very short
  if (projectTrimmed.length < 3) {
    console.log(`Rejected: "${projectTrimmed}" is too short`);
    return false;
  }

  // Check if it's just punctuation or special characters
  if (/^[^\w\s]+$/.test(projectTrimmed)) {
    console.log(`Rejected: "${projectTrimmed}" is just punctuation`);
    return false;
  }

  // Check if pages and rate are reasonable
  if (isNaN(pages) || pages <= 0 || pages > 10000) {
    console.log(`Rejected: Invalid pages value: ${pages} for "${projectTrimmed}"`);
    return false;
  }

  if (isNaN(rate) || rate <= 0 || rate > 100000) {
    console.log(`Rejected: Invalid rate value: ${rate} for "${projectTrimmed}"`);
    return false;
  }

  // Check if the row has meaningful content beyond just the project name
  const meaningfulFields = Object.entries(rawRow).filter(([key, value]) => {
    if (!value || typeof value !== 'string') return false;
    const cleanValue = value.trim();
    return cleanValue.length > 0 && cleanValue !== projectTrimmed;
  });

  // Must have at least project name + one other meaningful field
  if (meaningfulFields.length === 0) {
    console.log(`Rejected: "${projectTrimmed}" has no additional meaningful content`);
    return false;
  }

  console.log(`Accepted: "${projectTrimmed}" passed validation`);
  return true;
}

/**
 * Format date to YYYY-MM-DD format
 */
function formatDate(dateInput: any): string {
  if (!dateInput) return new Date().toISOString().split('T')[0];
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Parse CSV text to JSON with better handling
 */
export function csvToJson(csvText: string): NotionTaskRow[] {
  if (!csvText.trim()) return [];

  console.log('Raw CSV length:', csvText.length);

  // Use advanced CSV parsing
  const parsedLines = parseCSVAdvanced(csvText);

  if (parsedLines.length < 2) {
    console.log('Not enough lines in CSV');
    return [];
  }

  console.log('Parsed lines count:', parsedLines.length);
  console.log('Headers:', parsedLines[0]);

  const headers = parsedLines[0];
  const rows: NotionTaskRow[] = [];

  for (let i = 1; i < parsedLines.length; i++) {
    const values = parsedLines[i];

    // Skip completely empty rows
    if (values.every(v => !v || !v.trim())) {
      console.log(`Skipping empty row ${i}`);
      continue;
    }

    const row: NotionTaskRow = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    // Only add rows that have meaningful content
    const hasContent = Object.values(row).some(value =>
      value && typeof value === 'string' && value.trim().length > 0
    );

    if (hasContent) {
      console.log(`Row ${i}:`, row);
      rows.push(row);
    } else {
      console.log(`Skipping row ${i} - no meaningful content`);
    }
  }

  console.log('Final parsed rows:', rows.length);
  return rows;
}

/**
 * Parse CSV with proper handling of multi-line content and quotes
 */
function parseCSVAdvanced(csvText: string): string[][] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  // First, handle multi-line content properly
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if (char === '\n' && !inQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }

  // Add the last line if it exists
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  // Now parse each line
  return lines.map(line => parseCSVLine(line));
}

/**
 * Parse a single CSV line with proper quote handling
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Handle escaped quotes
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cleanCellValue(current));
      current = '';
    } else {
      current += char;
    }
  }

  result.push(cleanCellValue(current));
  return result;
}

/**
 * Clean and normalize cell values
 */
function cleanCellValue(value: string): string {
  return value
    .trim()
    .replace(/^"(.*)"$/, '$1') // Remove surrounding quotes
    .replace(/""/g, '"') // Unescape quotes
    .replace(/\r?\n/g, ' ') // Replace line breaks with spaces
    .replace(/\s+/g, ' ') // Normalize multiple spaces
    .trim();
}

/**
 * Sample data for testing
 */
export const sampleNotionData: NotionTaskRow[] = [
  {
    'Project Name': 'Website Redesign',
    'Pages': '8',
    'Rate': '150',
    'Status': 'In Progress',
    'Notes': 'Modern responsive design with dark mode',
    'Start Date': '2024-01-15',
    'Due Date': '2024-02-15'
  },
  {
    'Project Name': 'Logo Design',
    'Pages': '3',
    'Rate': '200',
    'Status': 'Pending',
    'Notes': 'Brand identity for tech startup',
    'Start Date': '2024-01-20',
    'Due Date': '2024-02-05'
  },
  {
    'Project Name': 'Mobile App UI',
    'Pages': '12',
    'Rate': '120',
    'Status': 'Completed',
    'Notes': 'iOS and Android app interface',
    'Start Date': '2024-01-01',
    'Due Date': '2024-01-25'
  }
];

/**
 * Generate sample ProFlow JSON for testing
 */
export function generateSampleJson(): string {
  const converted = convertNotionToProFlow(sampleNotionData);
  return JSON.stringify(converted, null, 2);
}
