// Add these functions in LeadFinder.jsx

// ✅ COPY URL
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  toast.success('📋 Copied!');
};

// ✅ EXPORT EXCEL (Add in LeadFinder)
const exportExcel = () => {
  if (!filteredResults.length) {
    toast.error('No data');
    return;
  }

  const data = filteredResults.map(l => ({
    Name: l.name || '',
    Phone: l.phone || '',
    Website: l.website || '',
    Address: l.address || '',
    Rating: l.rating || 0,
    Reviews: l.reviews || 0
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Leads');
  XLSX.writeFile(wb, `leads_${Date.now()}.xlsx`);
  toast.success('📊 Excel exported');
};

// Add Copy button in table actions:
<button onClick={() => copyToClipboard(lead.website || lead.phone || lead.email)} className="text-gray-400 hover:text-primary-500" title="Copy">
  <FaCopy size={14} />
</button>
