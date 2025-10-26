import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface PortfolioExportData {
  name: string;
  sector: string;
  stage: string;
  country: string;
  founded_year: number | null;
  investment_date: string | null;
  website_url: string | null;
  investment_thesis: string | null;
  description: string | null;
  key_metrics: string;
  timeline_events: string;
}

export const preparePortfolioData = (companies: any[]): PortfolioExportData[] => {
  return companies.map(company => {
    // Format metrics
    let keyMetrics = 'N/A';
    if (company.metrics && typeof company.metrics === 'object') {
      const metricsArray = Object.entries(company.metrics)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' | ');
      keyMetrics = metricsArray || 'N/A';
    }

    // Format timeline
    let timelineEvents = 'N/A';
    if (company.timeline && Array.isArray(company.timeline)) {
      timelineEvents = `${company.timeline.length} events`;
    }

    return {
      name: company.name || '',
      sector: company.sector || '',
      stage: company.stage || '',
      country: company.country || '',
      founded_year: company.founded_year,
      investment_date: company.investment_date,
      website_url: company.website_url || '',
      investment_thesis: company.investment_thesis || '',
      description: company.description || '',
      key_metrics: keyMetrics,
      timeline_events: timelineEvents,
    };
  });
};

export const exportToCSV = (data: PortfolioExportData[], filename: string) => {
  const csv = Papa.unparse(data, {
    header: true,
    columns: [
      'name',
      'sector',
      'stage',
      'country',
      'founded_year',
      'investment_date',
      'website_url',
      'investment_thesis',
      'description',
      'key_metrics',
      'timeline_events',
    ],
  });

  // Add UTF-8 BOM for proper Excel display
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToExcel = (data: PortfolioExportData[], filename: string) => {
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data, {
    header: [
      'name',
      'sector',
      'stage',
      'country',
      'founded_year',
      'investment_date',
      'website_url',
      'investment_thesis',
      'description',
      'key_metrics',
      'timeline_events',
    ],
  });

  // Set column headers
  XLSX.utils.sheet_add_aoa(worksheet, [[
    'Name',
    'Sector',
    'Stage',
    'Country',
    'Founded Year',
    'Investment Date',
    'Website',
    'Investment Thesis',
    'Description',
    'Key Metrics',
    'Timeline Events',
  ]], { origin: 'A1' });

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Portfolio Companies');

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, filename);
};
