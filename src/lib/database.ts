import type { Task, List, Project, Team, User } from "./schema";

import { supabase } from "./supabaseClient";
import { databaseState, type DatabaseState } from "./index";

export const getLists = async (project_id: string): Promise<List[]> => {
    // @ts-ignore
    return (await supabase.from("lists").select().match({ project_id })).data;
}

export const getTasks = async (list_id: string): Promise<Task[]> => {
    // @ts-ignore
    return (await supabase.from("tasks").select().match({ list_id }).order('index', { ascending: true })).data;
}