import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nmrxzedrzfuiahctmrtt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tcnh6ZWRyemZ1aWFoY3RtcnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwMTc2MjksImV4cCI6MjAyMzU5MzYyOX0.sBOhcsplDRrKKft67_LroHh-ZmbkRkPACLeHd_MQbBI';
export const supabase = createClient(supabaseUrl, supabaseKey);