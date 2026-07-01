-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(50),
    painters_count INTEGER DEFAULT 0,
    admin_count INTEGER DEFAULT 0,
    estimators_count INTEGER DEFAULT 0,
    managers_count INTEGER DEFAULT 0,
    booths_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id VARCHAR(50) REFERENCES companies(id) ON DELETE SET NULL,
    role VARCHAR(50) DEFAULT 'CUSTOMER',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id VARCHAR(50) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    
    total_sales NUMERIC,
    panel_sales NUMERIC,
    paint_sales NUMERIC,
    part_sales NUMERIC,
    other_sales NUMERIC,
    sales_per_ro NUMERIC,
    effective_labour_rate NUMERIC,
    parts_to_labour_sales NUMERIC,
    panel_labour_costs NUMERIC,
    paint_labour_costs NUMERIC,
    administration_costs NUMERIC,
    parts_costs NUMERIC,
    effective_labour_cost NUMERIC,
    total_labour_gross_profit_pct NUMERIC,
    parts_gross_profit_pct NUMERIC,
    total_gross_profit_dollars NUMERIC,
    total_gross_profit_pct NUMERIC,
    vehicles_per_day_per_booth NUMERIC,
    panel_utilisation NUMERIC,
    paint_utilisation NUMERIC,
    panel_productive_efficiency NUMERIC,
    paint_productive_efficiency NUMERIC,
    overall_efficiency NUMERIC,
    labour_diversion NUMERIC,
    completed_ro NUMERIC,
    cycle_time_total_k2k NUMERIC,
    booth_cycle_time NUMERIC,
    liquid_cost_to_refinish_labour_sales NUMERIC,
    paint_cost_per_ro NUMERIC,
    paint_consumables NUMERIC,
    paint_cost_to_total_sales NUMERIC,
    paint_hours_per_ro NUMERIC,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, year, month)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analytics_data_company_period ON analytics_data(company_id, year, month);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for `profiles`
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- RLS Policies for `companies`
CREATE POLICY "Users can view own company or all if admin" 
ON companies FOR SELECT 
USING (
    id = (SELECT company_id FROM profiles WHERE id = auth.uid()) OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN'
);

-- Admins can insert/update companies
CREATE POLICY "Admins can insert companies" 
ON companies FOR INSERT 
WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

CREATE POLICY "Admins can update companies" 
ON companies FOR UPDATE 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

CREATE POLICY "Users can update own company" 
ON companies FOR UPDATE 
USING (id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for `analytics_data`
CREATE POLICY "Users can view own company analytics or all if admin" 
ON analytics_data FOR SELECT 
USING (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()) OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN'
);

CREATE POLICY "Admins can insert analytics data" 
ON analytics_data FOR INSERT 
WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

CREATE POLICY "Admins can update analytics data" 
ON analytics_data FOR UPDATE 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

CREATE POLICY "Admins can delete analytics data" 
ON analytics_data FOR DELETE 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');
