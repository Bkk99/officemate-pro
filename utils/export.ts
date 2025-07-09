
// Function to convert an array of objects to CSV string
const convertToCSV = (objArray: any[], headerMapping: Record<string, string>) => {
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
  let str = '';

  const headers = Object.keys(headerMapping);
  const headerLabels = Object.values(headerMapping);
  
  str += headerLabels.join(',') + '\r\n';

  // Handle case where we just want the header for a template
  if (array.length === 1 && Object.keys(array[0]).length === 0) {
      return str;
  }

  for (let i = 0; i < array.length; i++) {
    let line = '';
    for (const header of headers) {
      if (line !== '') line += ',';

      let value = array[i][header] ?? '';
      if (typeof value === 'string') {
        // Escape quotes by doubling them and wrap the whole value in quotes
        value = `"${value.replace(/"/g, '""')}"`;
      }
      line += value;
    }
    str += line + '\r\n';
  }
  return str;
};

export const exportToCsv = (filename: string, data: any[], headerMapping: Record<string, string>) => {
  const isTemplateOnly = data.length === 1 && Object.keys(data[0]).length === 0;

  if (!isTemplateOnly && (!data || data.length === 0)) {
    alert("ไม่มีข้อมูลสำหรับส่งออก");
    return;
  }

  const csvStr = convertToCSV(data, headerMapping);
  const blob = new Blob(['\uFEFF' + csvStr], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel UTF-8 support
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename + '.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};


export const parseCsvFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                if (!text) return resolve([]);
                
                const lines = text.split(/\r\n|\n/).filter(l => l.trim());
                if (lines.length < 2) return resolve([]); // Needs header and data
                
                // Regex to split CSV row correctly, handling quotes
                const splitter = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
                const trimQuotes = (s: string) => s.trim().replace(/^"|"$/g, '').replace(/""/g, '"');

                const headers = lines[0].split(splitter).map(trimQuotes);
                
                const data = lines.slice(1).map(line => {
                    const values = line.split(splitter).map(trimQuotes);
                    const obj: Record<string, string> = {};
                    headers.forEach((header, index) => {
                        obj[header] = values[index] || '';
                    });
                    return obj;
                });
                
                resolve(data);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = error => reject(error);
        reader.readAsText(file, 'UTF-8');
    });
};