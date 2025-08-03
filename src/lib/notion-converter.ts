// Utility functions to help convert Notion data to ProFlow task format

export interface NotionTaskRow {
  [key: string]: any;
}

export interface ProFlowTask {
  projectName: string;
  pages: number;
  rate: number;
  workStatus: 'Pending' | 'In Progress' | 'Completed';
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
export function convertNotionToProFlow(notionData: NotionTaskRow[]): ProFlowTask[] {
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
      parseFloat(row.rate || row.Rate || row.price || row.Price || row.cost || row.Cost || '100');

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
      rate: isNaN(rate) ? 100 : rate,
      workStatus,
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
  // Check for obvious non-task indicators
  const projectLower = projectName.toLowerCase();

  // Skip rows that look like totals, amounts, or summaries
  const invalidPatterns = [
    'total', 'sum', 'amount received', 'amount paid', 'balance', 'subtotal',
    'grand total', 'payment', 'invoice', 'receipt', 'summary', 'notes',
    'remarks', 'footer', 'header', 'title row'
  ];

  if (invalidPatterns.some(pattern => projectLower.includes(pattern))) {
    console.log(`Rejected: "${projectName}" matches invalid pattern`);
    return false;
  }

  // Check if it's just a number (like "720")
  if (/^\d+(\.\d+)?$/.test(projectName.trim())) {
    console.log(`Rejected: "${projectName}" is just a number`);
    return false;
  }

  // Check if project name is too short or generic
  if (projectName.trim().length < 3) {
    console.log(`Rejected: "${projectName}" is too short`);
    return false;
  }

  // Check if pages and rate are reasonable
  if (isNaN(pages) || pages <= 0 || pages > 10000) {
    console.log(`Rejected: Invalid pages value: ${pages}`);
    return false;
  }

  if (isNaN(rate) || rate <= 0 || rate > 100000) {
    console.log(`Rejected: Invalid rate value: ${rate}`);
    return false;
  }

  // Check if the row has meaningful content
  const hasContent = Object.values(rawRow).some(value =>
    value && typeof value === 'string' && value.trim().length > 2
  );

  if (!hasContent) {
    console.log(`Rejected: No meaningful content in row`);
    return false;
  }

  console.log(`Accepted: "${projectName}" passed validation`);
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
  const lines = csvText.trim().split('\n').filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  console.log('CSV Lines:', lines);

  // Parse headers with better quote handling
  const headers = parseCSVLine(lines[0]);
  console.log('Headers:', headers);

  const rows: NotionTaskRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    // Skip empty rows
    if (values.every(v => !v.trim())) continue;

    const row: NotionTaskRow = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    // Only add rows that have at least one meaningful value
    if (Object.values(row).some(value => value && value.trim().length > 0)) {
      console.log(`Row ${i}:`, row);
      rows.push(row);
    }
  }

  console.log('Parsed rows:', rows.length);
  return rows;
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
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
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
