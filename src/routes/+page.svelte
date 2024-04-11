<script lang="ts">
    import List from "./List.svelte";
    import Task from "./Task.svelte";
    import type { Task as TaskSchema, StateList, List as ListSchema } from "$lib/schema";
    import { getLists, getTasks } from "$lib/database";
    import { appState, databaseState, clickOutside, blurInDownwards, syncing, type LocalTeam, type LocalProject, type WithId, localState, colors, colorsNamed } from "$lib";
    import { onMount } from "svelte";
    import SidebarInput from "./SidebarInput.svelte";
    import { DropdownMenu } from "bits-ui";
    import { fade } from "svelte/transition";
    import { supabase } from "$lib/supabaseClient";
    import Loader from "./Loader.svelte";
    import Tag from "./Tag.svelte";
    import type { Tag as TagSchema } from "$lib/schema";
    import Blanket from "./Blanket.svelte";
    import SettingsModal from "./SettingsModal.svelte";
    import NewListModal from "./NewListModal.svelte";

    let mounted: boolean = false;

    let left: number = 0;
    let width: number = 46.234375;

    let accountDropdownOpen: boolean = false;

    let view: 'timeline' | 'board' = 'board';
    let sidebarNavActive = 1;

    let sidebarShowingTags: TagSchema[];
    let sidebarTagSearchTerm: string = "";
    let showingTagsDropdownMenu: boolean = false;

    const set = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const boundingBox = target.getBoundingClientRect();

        const parent = target.parentElement as HTMLElement;
        const parentBoundingBox = parent.getBoundingClientRect();

        left = boundingBox.left - parentBoundingBox.left;
        width = boundingBox.width;

        view = target.getAttribute('data-tab') === '1' ? 'board' : 'timeline';
    };

    onMount(async () => {
        let lists: StateList[];
        let project: WithId<string> = {
            name: "",
            id: "",
        };
        let team: WithId<string> = {
            name: "",
            id: "",
        };

        const teams = await supabase.from("teams").select();

        if (!teams.data || teams.data.length < 1) {
            window.location.assign('/create/team');
        }

        // @ts-ignore
        const projects = await supabase.from("projects").select().eq('team_id', teams.data[0].id);

        if (!projects.data || projects.data.length < 1) {
            window.location.assign('/create/project');
        }

        // @ts-ignore
        project.id = $localState.project?.id ?? projects.data[0].id;
        // @ts-ignore
        project.name = $localState.project?.name ?? projects.data[0].name;
        // @ts-ignore
        team.id = $localState.team?.name ?? teams.data[0].id;
        // @ts-ignore
        team.name = $localState.team?.name ?? teams.data[0].name;

        // localState hasn't been set yet
        if (Object.entries($localState).length === 0) {
            $localState = { project, team };
        }

        lists = await Promise.all((await getLists(project.id)).map(async (x: ListSchema): Promise<StateList> => {
            return { ...x, tasks: await getTasks(x.id) };
        }));

        const tags = await supabase.from("tags").select().eq('project_id', project.id);
        
        if (!tags.data) 
            return console.error('tags.data is ', tags.data);

        databaseState.set({ team, project, lists, teams: [], tags: tags.data });
        sidebarShowingTags = $databaseState.tags;
        mounted = true;

        if (!teams.data)
            return console.error('teams is ', teams);

        let localTeams: LocalTeam[] = [];

        for (const team of teams.data) {
            const projects = await supabase.from("projects").select().eq('team_id', team.id);

            let localProjects: LocalProject[] = [];

            if (!projects.data)
                return console.error('projects is ', projects);            

            for (const project of projects.data) {
                localProjects.push({
                    name: project.name,
                    id: project.id,
                });
            }

            localTeams.push({
                name: team.name,
                id: team.id,
                projects: localProjects,
            });

            $databaseState.teams = localTeams;
        }
    });

    const handleInserts = (payload: object) => {
        if (!mounted)
            return;
        
        // @ts-ignore
        let task: TaskSchema = payload.new;
        const list_idx = $databaseState.lists.findIndex(x => x.id === task.list_id);
        const impostor = $databaseState.lists[list_idx].tasks.findIndex(x => x.id === "");
        
        if (impostor !== -1)
            $databaseState.lists[list_idx].tasks.splice(impostor, 1);

        $databaseState.lists[list_idx].tasks.push(task);
        $databaseState = $databaseState;
    }

    const handleDeletes = async (payload: object) => {
        if (!mounted)
            return;
        
        // @ts-ignore
        const task_id = payload.old.id;
        let task_coords: [number, number] = [-1, -1];

        for (const [i, list] of $databaseState.lists.entries()) {
            const index = list.tasks.findIndex(x => x.id === task_id);

            if (index === -1) continue;
            else {
                task_coords = [i, index];
                break;
            };
        }

        if (task_coords[0] !== -1 && task_coords[1] !== -1) {
            $databaseState.lists[task_coords[0]].tasks.splice(task_coords[1], 1);
            $databaseState = $databaseState;
        }
    }

    const handleUpdates = async (payload: object) => {
        if (!mounted)
            return;
        
        // @ts-ignore
        const task_id = payload.old.id;
        let task_coords: [number, number] = [-1, -1];
        let old_task: TaskSchema | null = null;

        for (const [i, list] of $databaseState.lists.entries()) {
            const index = list.tasks.findIndex(x => x.id === task_id);

            if (index === -1) continue;
            else {
                task_coords = [i, index];
                old_task = list.tasks[index];
                break;
            };
        }

        if (!old_task) 
            return console.error('yo what');
    
        const originList = $databaseState.lists.find(x => x.id === old_task?.list_id)?.tasks;
        // @ts-ignore
        const finalList = $databaseState.lists.find(x => x.id === payload.new.list_id)?.tasks;

        if (originList && finalList) {
            originList.splice(originList.findIndex(x => x.id === old_task?.id), 1)[0];
            // @ts-ignore
            finalList.push(payload.new);
            
            $databaseState = $databaseState;
        }
    }

    supabase
        .channel('channel1')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks' }, handleInserts)
        .subscribe();
    
    supabase
        .channel('channel2')
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tasks' }, handleDeletes)
        .subscribe();

    supabase
        .channel('channel3')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, handleUpdates)
        .subscribe();

    const onSidebarTagSearchTermUpdate = () => {
        if ($databaseState) {
            sidebarShowingTags = [];
        
            for (const tag of $databaseState.tags) {
                if (tag.name.includes(sidebarTagSearchTerm)) {
                    sidebarShowingTags.push(tag);
                }
            }

            sidebarShowingTags = sidebarShowingTags;
        }
    };

    let updateTimeout: NodeJS.Timeout;

    const onTaskEdited = () => {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
            if ($appState.editingTask)
                supabase.from("tasks").update($appState.editingTask).eq('id', $appState.editingTask?.id).then(x => console.log(x))
        }, 1000);
    };

    let settingsModalOpen: boolean = false;
    let showingNewListModal: boolean = false;

    $: sidebarTagSearchTerm, onSidebarTagSearchTermUpdate();
    $: $appState.editingTask, onTaskEdited();
</script>

{#if mounted}
    <main class="w-screen h-screen bg-gray2 flex flex-row overflow-hidden">
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
        <aside class="w-60 h-full flex-none flex flex-row bg-gray1 border-r border-white/5 overflow-hidden">
            <div class="w-60 h-full flex-none flex flex-col" class:slid={$appState.editingTask} class:unslid={!$appState.editingTask}>
                <nav class="w-full h-12 border-b border-white/5 flex flex-row px-6 items-center">
                    <DropdownMenu.Root bind:open={accountDropdownOpen}>
                        <DropdownMenu.Trigger>
                            <button class="size-fit p-1.5 -ml-1.5 flex flex-row gap-1.5 hover:bg-white/5 rounded-md items-center">
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="18" height="18" rx="6" fill="#4CA8DF"/>
                                </svg>
                                <p class="text-xs text-white leading-[18px]">{$databaseState.team.name}</p>
                                <svg class="-mx-1" width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 5.59993L7.5 3.2666L10 5.59993" stroke="#A0A0A0"/>
                                    <path d="M10 8.3999L7.5 10.7332L5 8.3999" stroke="#A0A0A0"/>
                                </svg>
                            </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content transition={blurInDownwards} transitionConfig={{ duration: 75 }} sideOffset={4} align={"start"} alignOffset={-6} class="shadow-[0px_97px_39px_rgba(0,0,0,0.02),0px_54px_33px_rgba(0,0,0,0.08),0px_24px_24px_rgba(0,0,0,0.13),0px_6px_13px_rgba(0,0,0,0.15)] w-[204px] h-fit rounded-md bg-[#313131] border border-[#ffffff06] flex flex-col pb-1"> 
                            {#each $databaseState.teams as team}
                                <div class="w-fill h-fit flex flex-row px-3 pt-2">
                                    <p class="text-white/75 text-[11px] leading-5 select-none">{team.name}</p>
                                    <button on:click={() => { settingsModalOpen = true; accountDropdownOpen = false }} class="size-5 rounded-md hover:bg-white/15 flex items-center justify-center text-white/75 ml-auto">
                                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5Z" fill="currentColor"/>
                                            <path d="M8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5Z" fill="currentColor"/>
                                            <path d="M13.5 7.5C13.5 8.12132 12.9963 8.625 12.375 8.625C11.7537 8.625 11.25 8.12132 11.25 7.5C11.25 6.87868 11.7537 6.375 12.375 6.375C12.9963 6.375 13.5 6.87868 13.5 7.5Z" fill="currentColor"/>
                                        </svg>                                        
                                    </button>
                                </div>
                                <div class="flex flex-col px-1 w-full h-fit">
                                    {#each team.projects as project}
                                        <DropdownMenu.Item on:click={() => {
                                            $databaseState.project = project;
                                            $databaseState.team = team;
                                            $localState.project = project;
                                            $localState.team = {
                                                name: team.name,
                                                id: team.id,
                                            };

                                            window.location.assign('/');
                                        }} class="outline-none w-full h-8 rounded-md px-2 flex flex-row items-center select-none cursor-pointer text-white text-xs active:bg-white/10 hover:bg-white/10">
                                            {project.name}
                                        </DropdownMenu.Item>
                                    {/each}
                                    <DropdownMenu.Item on:click={() => window.location.assign('/create/project')} class="outline-none w-full h-8 rounded-md px-2 flex flex-row items-center select-none cursor-pointer text-white/50 text-xs active:bg-white/10 hover:bg-white/10">
                                        Create project
                                    </DropdownMenu.Item>
                                </div>
                            {/each}
                            <DropdownMenu.Separator class="my-1 bg-white/10 h-[1px]" />
                            <div class="flex flex-col px-1 w-full h-fit">
                                <div class="w-full h-fit rounded bg-white/10 flex flex-col p-2 select-none">
                                    <p class="text-white leading-5 text-xs w-full">Invite</p>
                                    <p class="text-white/60 leading-5 text-xs w-full">Invite collaborators to this team. Requires a Pro plan.</p>
                                    <button class="rounded-md bg-[#0C8CE9] text-xs text-white px-2 h-6 w-fit mt-1 hover:bg-[#39A1ED]">Upgrade</button>
                                </div>
                            </div>
                            <DropdownMenu.Separator class="my-1 bg-white/10 h-[1px]" />
                            <div class="flex flex-col px-1 w-full h-fit">
                                <DropdownMenu.Item on:click={() => window.location.assign('/create/team')} class="outline-none w-full h-8 rounded-md px-2 flex flex-row items-center select-none cursor-pointer text-white text-xs active:bg-white/10 hover:bg-white/10">
                                    Create team
                                    <span class="ml-auto text-white/50 text-[11px]">⌘N</span>
                                </DropdownMenu.Item>
                            </div>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
        
                    <div class="ml-auto">
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger class="translate-y-[3px]">
                                <img src="https://nmrxzedrzfuiahctmrtt.supabase.co/storage/v1/object/public/profile-pictures/arvsrn.png?t=2024-03-06T14%3A03%3A33.796Z" class="cursor-pointer size-[18px] rounded-full select-none " draggable="false" alt="">
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content align="end" transition={blurInDownwards} transitionConfig={{ duration: 75 }} sideOffset={8} alignOffset={4} class="w-36 p-1 h-fit outline outline-1 -outline-offset-1 outline-[#ffffff06] rounded-lg bg-[#404040] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)]">
                                <DropdownMenu.Item on:click={() => settingsModalOpen = true} class="h-7 text-xs text-white px-2 leading-[25px] hover:bg-white/10 active:bg-white/15 outline-none !ring-0 !ring-transparent rounded select-none cursor-pointer flex items-center">Profile</DropdownMenu.Item>
                                <DropdownMenu.Item on:click={() => settingsModalOpen = true} class="h-7 text-xs text-white px-2 leading-[25px] hover:bg-white/10 active:bg-white/15 outline-none !ring-0 !ring-transparent rounded select-none cursor-pointer flex items-center">Preferences</DropdownMenu.Item>
                                <DropdownMenu.Item on:click={() => supabase.auth.signOut().then(x => window.location.assign('/'))} class="h-7 text-xs text-[#FF8A7B] px-2 leading-[25px] hover:bg-white/10 active:bg-white/15 outline-none !ring-0 !ring-transparent rounded select-none cursor-pointer flex items-center">Log out</DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                    </div>
                </nav>
                
                <div class:fade={accountDropdownOpen} class="transition-all duration-75 ease-in-out">
                    <nav class="w-full h-9 px-6 gap-3 flex flex-row border-b border-white/5 select-none">
                        <button class="text-[11px] text-white/50 w-fit h-full border-b-2 border-transparent" class:nav2-active={sidebarNavActive === 1} on:click={() => sidebarNavActive = 1}>Assigned to you</button>
                        <button class="text-[11px] text-white/50 w-fit h-full border-b-2 border-transparent" class:nav2-active={sidebarNavActive === 2} on:click={() => sidebarNavActive = 2}>Progress</button>
                    </nav>
                    <div class="w-full h-fit p-3 flex flex-col gap-1.5">
                        {#if mounted}
                            {#each $databaseState.lists[0].tasks as task}
                                <Task {task} fill></Task>
                            {/each}
                        {/if}
                    </div>
                </div>
            </div>

            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="w-60 h-full flex-none" class:slid={$appState.editingTask} class:unslid={!$appState.editingTask}>
                {#if $appState.editingTask}
                    <nav class="w-full h-12 border-b border-white/5 flex flex-row px-6 items-center">
                        <p class="text-xs text-white leading-5">Editing Event</p>
                        <button on:click={() => $appState.editingTask = null} class="bg-white/10 hover:bg-white/15 size-5 rounded-md ml-auto flex items-center justify-center text-white/75">
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.5 10.5L5.5 7.5L8.5 4.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>                        
                        </button>
                    </nav>
                    <div class="w-full h-fit flex flex-col gap-2 p-3 border-b border-white/5">
                        <SidebarInput title="Title" bind:value={$appState.editingTask.title} />
                        <SidebarInput title="Description" bind:value={$appState.editingTask.description} />
                    </div>
                    <div class="w-full h-fit p-3 flex flex-row gap-1 border-b border-white/5 flex-wrap">
                        {#if $appState.editingTask && $appState.editingTask.tags}
                            {#each $appState.editingTask.tags as tag}
                                {@const realTag = $databaseState.tags.find(x => x.id === tag)}

                                {#if realTag}
                                    <Tag sidebar onClick={() => showingTagsDropdownMenu = true} tag={realTag}></Tag>
                                {/if}
                            {/each}
                        {/if}
                        
                        <DropdownMenu.Root bind:open={showingTagsDropdownMenu}>
                            <DropdownMenu.Trigger>
                                {#if $appState.editingTask?.tags.length ?? 0 > 0}
                                    <div class="size-[23px] flex items-center justify-center bg-transparent text-white/50 hover:bg-white/10 cursor-pointer rounded-lg">
                                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 7.5H3M7.5 12V3" stroke="currentColor" stroke-opacity="0.75"/>
                                        </svg>                        
                                    </div>
                                {:else}
                                    <div class="h-[23px] text-xs w-fit px-2 gap-1 flex items-center justify-center bg-transparent text-white/50 hover:bg-white/10 cursor-pointer rounded-lg">
                                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 7.5H3M7.5 12V3" stroke="currentColor" stroke-opacity="0.75"/>
                                        </svg> 
                                        Add label  
                                    </div>
                                {/if}
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content transition={blurInDownwards} transitionConfig={{ duration: 80 }} align={"start"} alignOffset={-4} sideOffset={4} class="w-52 h-fit rounded-lg bg-[#313131] border border-[#ffffff06] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)]">
                                <div class="flex flex-col p-1 w-full h-fit">
                                    <DropdownMenu.Group>
                                        <input bind:value={sidebarTagSearchTerm} class="outline-none mb-1 w-full h-8 rounded-md px-2 flex flex-row items-center gap-2 select-none cursor-pointer text-white text-xs border border-white/10 bg-transparent focus:bg-white/5 hover:bg-white/5" placeholder="Add labels...">
                                    </DropdownMenu.Group>
                                    
                                    {#each sidebarShowingTags as tag}
                                        <DropdownMenu.Item on:click={() => {
                                            const index = $appState.editingTask?.tags.findIndex(x => x === tag.id) ?? -1;
                                            
                                            if ($appState.editingTask && index !== -1) {
                                                $appState.editingTask.tags.splice(index, 1);
                                            } else {
                                                $appState.editingTask?.tags.push(tag.id); 
                                            }

                                            $appState.editingTask = $appState.editingTask;
                                        }} class="outline-none w-full h-8 rounded-md px-2 flex flex-row items-center gap-2 select-none cursor-pointer text-white text-xs active:bg-white/10 hover:bg-white/10">
                                            <button class:checkbox-selected={$appState.editingTask?.tags.findIndex(x => x === tag.id) !== -1} class="size-4 rounded-md border border-white/15 bg-transparent flex items-center justify-center">
                                                {#if $appState.editingTask?.tags.findIndex(x => x === tag.id) !== -1}
                                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M3.5 7.5L6.5 10.5L7.30318 9.21492C8.4263 7.41792 9.84525 5.8238 11.5 4.5V4.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                                                    </svg>
                                                {/if}
                                            </button>
                                            <div class="size-2 rounded-full" style:background={colors[tag.color]}></div>
                                            <p class="text-xs leading-[23px] text-white">{tag.name}</p>
                                        </DropdownMenu.Item>
                                    {/each}

                                    {#if sidebarTagSearchTerm.length > 1}
                                        <DropdownMenu.Sub>
                                            <DropdownMenu.SubTrigger class="outline-none w-full h-8 rounded-md px-2 flex flex-row items-center gap-2 select-none cursor-pointer text-white text-xs active:bg-white/10 hover:bg-white/10">
                                                <p class="text-xs leading-[23px] text-white/50">Create label: "<span class="text-white">{sidebarTagSearchTerm}</span>"</p>
                                            </DropdownMenu.SubTrigger>
                                            <DropdownMenu.SubContent transition={blurInDownwards} transitionConfig={{ duration: 75 }} sideOffset={4} align={"start"} alignOffset={-6} class="shadow-[0px_97px_39px_rgba(0,0,0,0.02),0px_54px_33px_rgba(0,0,0,0.08),0px_24px_24px_rgba(0,0,0,0.13),0px_6px_13px_rgba(0,0,0,0.15)] w-[120px] h-fit rounded-md bg-[#313131] border border-[#ffffff06] flex flex-col pb-1"> 
                                                <div class="w-fill h-fit flex flex-row px-3 pt-2">
                                                    <p class="text-white/50 text-[11px] leading-5 select-none">Choose a color</p>
                                                </div>
                                                <div class="flex flex-col px-1 w-full h-fit">
                                                    {#each colorsNamed as color, i}
                                                        <DropdownMenu.Item on:click={() => supabase.from("tags").insert({
                                                            name: sidebarTagSearchTerm,
                                                            color: i,
                                                            project_id: $localState.project.id
                                                        }).select().then(x => {
                                                            $databaseState.tags.push({
                                                                name: sidebarTagSearchTerm,
                                                                color: i,
                                                                project_id: $localState.project.id,
                                                                id: '',
                                                            });

                                                            if (x.data)
                                                                // @ts-ignore
                                                                $appState.editingTask?.tags.push(x.data.id);

                                                            $appState.editingTask = $appState.editingTask;
                                                            $databaseState.tags = $databaseState.tags;

                                                            sidebarTagSearchTerm = "";
                                                        })} class="gap-2 outline-none w-full h-8 rounded-md px-2 flex flex-row items-center select-none cursor-pointer text-white text-xs active:bg-white/10 hover:bg-white/10">
                                                            <div class="size-2 rounded-full" style:background={colors[i]}></div>
                                                            {color}
                                                        </DropdownMenu.Item>
                                                    {/each}
                                                </div>
                                            </DropdownMenu.SubContent>
                                        </DropdownMenu.Sub>
                                    {:else if sidebarShowingTags.length === 0}
                                        <p class="text-xs leading-[23px] text-white/50 mx-2">No tag found</p>
                                    {/if}
                                </div>
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                    </div>
                {/if}
            </div>
        </aside>
        
        <div class="size-full flex flex-col gap-4 pl-8 pt-8">
            <div class="w-fit h-fit flex flex-row gap-3">
                <div class="h-6 w-fit rounded-md bg-white/5 flex flex-row relative">
                    <div class="flex flex-row items-center justify-center px-2 w-fit h-full text-[11px] text-white rounded-md select-none cursor-pointer bg-transparent" data-tab="1" on:click={set}>Board</div>
                    <div class="flex flex-row items-center justify-center px-2 w-fit h-full text-[11px] text-white rounded-md select-none cursor-pointer bg-transparent" data-tab="2" on:click={set}>Timeline</div>
        
                    <div class="absolute h-full rounded-md bg-white/10 transition-all duration-75 ease-in-out" style:left="{left}px" style:width="{width}px"></div>
                </div>
        
                <div class="size-6 flex items-center justify-center text-white/50">
                    {#if $syncing}
                        <svg transition:fade={{ duration: 75 }} width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.625 11.5C0.870786 11.5 0.435941 5.53608 4.20355 5.02818C5.5349 1.16307 10.9999 2.15007 10.9999 6.25C14.2955 6.25 14.1678 11.5 10.9999 11.5H10.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M7.5 12.5L7.5 6.5M7.5 6.5L5.5 8.5M7.5 6.5L9.5 8.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>       
                    {/if}             
                </div>
            </div>

            <div data-scrollbars class="w-full h-full overflow-x-scroll flex flex-row gap-4 pb-8">
                {#if mounted}
                    {#each $databaseState.lists as list}
                        <List {list}></List>
                    {/each}
                {/if}

                <button on:click={() => showingNewListModal = true} class="flex-none h-8 w-fit px-3 text-xs border border-white/5 rounded-lg text-white hover:border-[#ffffff06] hover:bg-white/5">New list</button>
            </div>
        </div>
    </main>

    {#if settingsModalOpen}
        <Blanket onExit={() => settingsModalOpen = false}>
            <SettingsModal></SettingsModal>
        </Blanket>
    {/if}

    {#if showingNewListModal}
        <Blanket onExit={() => showingNewListModal = false}>
            <NewListModal bind:showingNewListModal={showingNewListModal} />
        </Blanket>
    {/if}
{:else}
    <main class="w-screen h-screen flex flex-col gap-2 items-center justify-center">
        <Loader></Loader>
    </main>
{/if}

<style>
    .active {
        @apply bg-white/10;
    }

    .nav2-active {
        @apply border-white text-white;
    }

    @keyframes toEditing {
        from {
            transform: translateX(0px);
        }

        to {
            transform: translateX(-100%);
        }
    }

    @keyframes fromEditing {
        from {
            transform: translateX(-100%);
        }

        to {
            transform: translateX(0px);
        }
    }

    .slid {
        animation: toEditing 150ms var(--ease);
        animation-fill-mode: forwards;
    }

    .unslid {
        animation: fromEditing 150ms var(--ease);
        animation-fill-mode: forwards;
    }

    .fade {
        opacity: 0.5;
    }

    .checkbox-selected {
        @apply border-transparent bg-[#258DEC] text-white;
    }

    [data-scrollbars]::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }

    [data-scrollbars]::-webkit-scrollbar-track {
        @apply bg-white/5;
    }

    [data-scrollbars]::-webkit-scrollbar-thumb {
        @apply bg-white/20;
    }

    [data-scrollbars]::-webkit-scrollbar-thumb:hover {
        @apply bg-white/40;
    }

    [data-scrollbars]::-webkit-scrollbar-corner {
        @apply bg-white/5;
    }

    .selected {
        @apply text-white/80;
    }
</style>