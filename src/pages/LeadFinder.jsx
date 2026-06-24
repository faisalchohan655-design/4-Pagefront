// src/pages/LeadFinder.jsx - Save Functions Only
// Add these functions in your LeadFinder component

// ✅ SAVE ALL
const handleSaveAll = async () => {
  if (!filteredResults.length) {
    toast.error('No leads to save');
    return;
  }

  setSaving(true);
  const toastId = toast.loading(`Saving ${filteredResults.length} leads...`);

  try {
    const leadsToSave = filteredResults.map(lead => ({
      name: lead.name || 'Unknown',
      email: lead.email || '',
      phone: lead.phone || '',
      address: lead.address || '',
      website: lead.website || '',
      rating: lead.rating || 0,
      reviews: lead.reviews || 0,
      source: 'google_maps'
    }));

    await addLeads(leadsToSave);
    
    setResults([]);
    setSelected([]);
    toast.success(`✅ ${leadsToSave.length} leads saved!`, { id: toastId });
  } catch (err) {
    toast.error('Failed to save', { id: toastId });
  } finally {
    setSaving(false);
  }
};

// ✅ SAVE SELECTED
const handleSaveSelected = async () => {
  if (!selected.length) {
    toast.error('No leads selected');
    return;
  }

  const leadsToSave = results.filter((_, idx) => selected.includes(idx));
  
  setSaving(true);
  const toastId = toast.loading(`Saving ${leadsToSave.length} leads...`);

  try {
    const formatted = leadsToSave.map(lead => ({
      name: lead.name || 'Unknown',
      email: lead.email || '',
      phone: lead.phone || '',
      address: lead.address || '',
      website: lead.website || '',
      rating: lead.rating || 0,
      reviews: lead.reviews || 0,
      source: 'google_maps'
    }));

    await addLeads(formatted);
    
    setResults(results.filter((_, idx) => !selected.includes(idx)));
    setSelected([]);
    toast.success(`✅ ${formatted.length} leads saved!`, { id: toastId });
  } catch (err) {
    toast.error('Failed to save', { id: toastId });
  } finally {
    setSaving(false);
  }
};
