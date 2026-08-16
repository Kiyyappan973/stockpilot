import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bohxnrettsirdczqtqbw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvaHhucmV0dHNpcmRjenF0cWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3OTQxNTAsImV4cCI6MjEwMjM3MDE1MH0.9Ui4ieYedb5UI82-wrgxy2T8Dem7tl3LjWSNl4X5qa4'

export const supabase = createClient(supabaseUrl, supabaseKey)