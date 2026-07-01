import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const KEY_TO_DB = {
  'Company Id': 'company_id',
  'Company Name': 'company_name', 
  'State': 'state',
  'Year': 'year',
  'Month': 'month',
  'Total Sales': 'total_sales',
  'Panel Sales': 'panel_sales',
  'Paint Sales': 'paint_sales',
  'Part Sales': 'part_sales',
  'Other Sales': 'other_sales',
  'Sales per RO': 'sales_per_ro',
  'Effective Labour Rate': 'effective_labour_rate',
  'Parts to Labour Sales': 'parts_to_labour_sales',
  'Panel Labour Costs': 'panel_labour_costs',
  'Paint Labour Costs': 'paint_labour_costs',
  'Administration Costs': 'administration_costs',
  'Parts Costs': 'parts_costs',
  'Effective Labour Cost': 'effective_labour_cost',
  'Total Labour Gross Profit %': 'total_labour_gross_profit_pct',
  'Parts Gross Profit %': 'parts_gross_profit_pct',
  'Total Gross Profit $': 'total_gross_profit_dollars',
  'Total Gross Profit %': 'total_gross_profit_pct',
  'Vehicles per Day per Booth': 'vehicles_per_day_per_booth',
  'Panel Utilisation': 'panel_utilisation',
  'Paint Utilisation': 'paint_utilisation',
  'Panel Productive Efficiency': 'panel_productive_efficiency',
  'Paint Productive Efficiency': 'paint_productive_efficiency',
  'Overall Efficiency': 'overall_efficiency',
  'Labour Diversion': 'labour_diversion',
  'Completed RO': 'completed_ro',
  'Cycle Time Total (K2K)': 'cycle_time_total_k2k',
  'Booth Cycle Time': 'booth_cycle_time',
  'Liquid Cost to Refinish Labour Sales': 'liquid_cost_to_refinish_labour_sales',
  'Paint Cost per RO': 'paint_cost_per_ro',
  'Paint Consumables': 'paint_consumables',
  'Paint Cost to Total Sales': 'paint_cost_to_total_sales',
  'Paint Hours per RO': 'paint_hours_per_ro'
};

const DB_TO_KEY = Object.fromEntries(Object.entries(KEY_TO_DB).map(([k, v]) => [v, k]));

/**
 * Upload parsed CSV data to Supabase
 * @param {Array<Object>} csvData - Array of objects parsed from CSV by PapaParse
 */
export const uploadAnalytics = async (csvData) => {
  if (!csvData || csvData.length === 0) return;

  // Convert React UI keys to Database snake_case keys
  const rows = csvData.map(row => {
    const dbRow = {};
    for (const [key, value] of Object.entries(row)) {
      if (KEY_TO_DB[key]) {
        dbRow[KEY_TO_DB[key]] = value;
      }
    }
    return dbRow;
  });

  // 1. Upsert Companies to ensure foreign keys exist
  // We extract unique companies from the upload payload
  const uniqueCompanies = [...new Map(rows.map(r => [r.company_id, {
    id: r.company_id,
    name: csvData.find(c => c['Company Id'] === r.company_id)?.['Company Name'] || r.company_id,
    state: csvData.find(c => c['Company Id'] === r.company_id)?.['State'] || ''
  }])).values()];

  if (uniqueCompanies.length > 0) {
    const { error: compError } = await supabase.from('companies').upsert(uniqueCompanies);
    if (compError) throw compError;
  }

  // 2. Prepare Analytics rows by stripping non-analytics explicit columns mapped to 'companies' table
  const analyticsRows = rows.map(r => {
    const { company_name, state, ...rest } = r;
    return rest;
  });

  // 3. Chunk insertions for performance (Supabase limit is usually around MBs but 500 is safe)
  const chunkSize = 500;
  for (let i = 0; i < analyticsRows.length; i += chunkSize) {
    const chunk = analyticsRows.slice(i, i + chunkSize);
    const { error } = await supabase
      .from('analytics_data')
      .upsert(chunk, { onConflict: 'company_id, year, month' });
      
    if (error) throw error;
  }
  
  return true;
};

/**
 * Fetch analytics data and map back to React UI expected keys
 * @param {string|null} companyId - Optional company ID to filter by
 */
export const getAnalytics = async (companyId = null) => {
  let query = supabase
    .from('analytics_data')
    .select(`
      *,
      companies (
        name,
        state,
        painters_count,
        panel_beaters_count,
        admin_count,
        estimators_count,
        managers_count,
        booths_count
      )
    `)
    .order('year', { ascending: true })
    .order('month', { ascending: true });
    
  if (companyId) {
    query = query.eq('company_id', companyId);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Convert back to UI format seamlessly
  return data.map(dbRow => {
    const uiRow = {};
    
    // Flatten normalized company details
    uiRow['Company Name'] = dbRow.companies?.name || dbRow.company_id;
    uiRow['State'] = dbRow.companies?.state || '';
    
    // Flatten shop profile counts for easy UI access
    uiRow['painters_count'] = dbRow.companies?.painters_count || 0;
    uiRow['panel_beaters_count'] = dbRow.companies?.panel_beaters_count || 0;
    uiRow['admin_count'] = dbRow.companies?.admin_count || 0;
    uiRow['estimators_count'] = dbRow.companies?.estimators_count || 0;
    uiRow['managers_count'] = dbRow.companies?.managers_count || 0;
    uiRow['booths_count'] = dbRow.companies?.booths_count || 0;
    
    for (const [key, value] of Object.entries(dbRow)) {
      if (key === 'companies') continue; // Ignore the joined object
      if (DB_TO_KEY[key]) {
        uiRow[DB_TO_KEY[key]] = value;
      }
    }
    
    return uiRow;
  });
};

/**
 * Fetch all companies (Admin only)
 */
export const getCompanies = async () => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
};

/**
 * Fetch all profiles with their associated company (Admin only)
 */
export const getProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      companies (
        name
      )
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

/**
 * Invoke the edge function to invite a new customer
 */
export const inviteCustomer = async (email, companyId, token) => {
  const { data, error } = await supabase.functions.invoke('invite-user', {
    body: { email, companyId },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (error) throw error;
  return data;
};

/**
 * Create a new company manually
 */
export const createCompany = async (id, name) => {
  const { data, error } = await supabase
    .from('companies')
    .insert([{ id, name, state: '' }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Update the Shop Profile details for a company
 */
export const updateShopProfile = async (companyId, profileData) => {
  const { data, error } = await supabase
    .from('companies')
    .update({
      painters_count: parseInt(profileData.painters_count) || 0,
      panel_beaters_count: parseInt(profileData.panel_beaters_count) || 0,
      admin_count: parseInt(profileData.admin_count) || 0,
      estimators_count: parseInt(profileData.estimators_count) || 0,
      managers_count: parseInt(profileData.managers_count) || 0,
      booths_count: parseInt(profileData.booths_count) || 0
    })
    .eq('id', companyId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
