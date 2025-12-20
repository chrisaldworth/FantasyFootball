import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function parseCSV(csvContent: string): any[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length === 0) return [];

  // Parse header
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  
  // Parse data rows
  const records: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parsing (handles quoted fields)
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add last value

    // Create record object
    const record: any = {};
    headers.forEach((header, idx) => {
      let value = values[idx] || '';
      // Remove surrounding quotes if present
      value = value.replace(/^"|"$/g, '');
      record[header] = value;
    });
    records.push(record);
  }

  return records;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const season = searchParams.get('season') || '2023-2024';

    // Path to CSV file in backend directory
    const csvPath = path.join(process.cwd(), '..', 'backend', `pl_results_${season.replace('-', '_')}.csv`);
    
    // Check if file exists
    if (!fs.existsSync(csvPath)) {
      // Try detailed version
      const detailedPath = path.join(process.cwd(), '..', 'backend', `pl_results_${season.replace('-', '_')}_detailed.csv`);
      if (fs.existsSync(detailedPath)) {
        const csvContent = fs.readFileSync(detailedPath, 'utf-8');
        const records = parseCSV(csvContent);
        return NextResponse.json(records);
      }
      
      return NextResponse.json(
        { error: `CSV file not found for season ${season}` },
        { status: 404 }
      );
    }

    // Read and parse CSV file
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parseCSV(csvContent);

    return NextResponse.json(records);
  } catch (error: any) {
    console.error('Error reading CSV file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to read CSV file' },
      { status: 500 }
    );
  }
}

