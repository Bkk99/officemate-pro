
// Function to convert an array of objects to CSV string
const convertToCSV = (objArray: any[], headers?: string[]) => {
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
  let str = '';
  let line = '';

  if (headers) {
    line = headers.join(',');
  } else {
    // Fallback to using keys from the first object as headers
    const head = array.length > 0 ? Object.keys(array[0]) : [];
    line = head.join(',');
  }
  str += line + '\r\n';

  for (let i = 0; i < array.length; i++) {
    let line = '';
    for (const index in array[i]) {
      if (line !== '') line += ',';
      // Handle potential commas or newlines in data
      let value = array[i][index];
      if (typeof value === 'string') {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      line += value;
    }
    str += line + '\r\n';
  }
  return str;
};

export const exportToCsv = (filename: string, data: any[], headers?: string[]) => {
  if (!data || data.length === 0) {
    alert("ไม่มีข้อมูลสำหรับส่งออก");
    return;
  }
  const csvStr = convertToCSV(data, headers);
  const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
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
