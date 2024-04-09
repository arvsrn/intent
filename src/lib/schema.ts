export interface Tag {
    name: string;
    color: number;
    id: string;
    project_id: string;
}

export interface Task {
    id: string;
    list_id: string;
    title: string;
    description: string;
    index: number;
    tags: string[]
}

export interface List {
    id: string;
    project_id: string;
    name: string;
    color: number;    
}

export interface StateList extends List {
    tasks: Task[];
}

export interface Project {
    id: string;
    team_id: string;
    name: string;
}

export interface Team {
    id: string;
    name: string;
    members: string[];
    owner: string;
}

export interface User {
    id: string;
    name: string;
    display_name: string;
}