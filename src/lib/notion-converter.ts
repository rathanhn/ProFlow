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
}

/**
 * Convert Notion CSV/JSON data to ProFlow task format
 * This function helps map common Notion field names to ProFlow format
 */
export function convertNotionToProFlow(notionData: NotionTaskRow[]): ProFlowTask[] {
  return notionData.map((row, index) => {
    // Common field mappings - adjust these based on your Notion column names
    const projectName = 
      row.projectName || 
      row['Project Name'] || 
      row.project || 
      row.title || 
      row.name || 
      `Project ${index + 1}`;

    const pages = 
      parseInt(row.pages || row.Pages || row.page_count || row['Page Count'] || '1');

    const rate = 
      parseFloat(row.rate || row.Rate || row.price || row.Price || row.cost || row.Cost || '100');

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
    };
  });
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
 * Parse CSV text to JSON
 */
export function csvToJson(csvText: string): NotionTaskRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows: NotionTaskRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row: NotionTaskRow = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row);
  }

  return rows;
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
