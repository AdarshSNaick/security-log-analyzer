// Export Utilities for CSV and PDF Downloads

export const exportToCSV = (filename, data) => {
  if (!data || !data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Header line
  csvRows.push(headers.join(','));
  
  // Data lines
  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + (row[header] ?? '')).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToTextPDF = (filename, title, contentText) => {
  // Generates a downloadable clean formatted security report file (.txt/.pdf simulator)
  const reportHeader = `=================================================================\nSECURITY LOG ANALYZER - EXECUTIVE REPORT\nGenerated At: ${new Date().toLocaleString()}\nTitle: ${title}\n=================================================================\n\n`;
  
  const fullText = reportHeader + contentText;
  const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0,10)}.pdf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
