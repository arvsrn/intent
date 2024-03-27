<script lang="ts">
    import List from "./List.svelte";
    import Task from "./Task.svelte";
    import { getLists, getTasks } from "$lib/database";
    import type { StateList, List as ListSchema } from "$lib/schema";
    import { appState, databaseState, clickOutside, blurInDownwards, syncing } from "$lib";
    import { onMount } from "svelte";
    import Blanket from "./Blanket.svelte";
    import SidebarInput from "./SidebarInput.svelte";
    import { DropdownMenu } from "bits-ui";
    import { fade } from "svelte/transition";

    let mounted: boolean = false;

    let left: number = 0;
    let width: number = 46.234375;

    let accountDropdownOpen: boolean = false;

    let view: 'timeline' | 'board' = 'board';
    let sidebarNavActive = 1;

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
        const project = '4d080119-2a1c-49e7-97e5-76d5eb0e2ca2';
        const lists = await Promise.all((await getLists(project)).map(async (x: ListSchema): Promise<StateList> => {
            return { ...x, tasks: await getTasks(x.id) };
        }));
        
        databaseState.set({ project, lists });

        mounted = true;
    });
</script>

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
                            <p class="text-xs text-white leading-[18px]">Truelines</p>
                            <svg class="-mx-1" width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 5.59993L7.5 3.2666L10 5.59993" stroke="#A0A0A0"/>
                                <path d="M10 8.3999L7.5 10.7332L5 8.3999" stroke="#A0A0A0"/>
                            </svg>
                        </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content transition={blurInDownwards} transitionConfig={{ duration: 75 }} sideOffset={4} align={"start"} alignOffset={-6} class="shadow-[0px_97px_39px_rgba(0,0,0,0.02),0px_54px_33px_rgba(0,0,0,0.08),0px_24px_24px_rgba(0,0,0,0.13),0px_6px_13px_rgba(0,0,0,0.15)] w-[204px] h-[400px] rounded-md bg-[#313131] border border-[#ffffff06] "> 

                    </DropdownMenu.Content>
                </DropdownMenu.Root>
    
                <img src="https://nmrxzedrzfuiahctmrtt.supabase.co/storage/v1/object/public/profile-pictures/arvsrn.png?t=2024-03-06T14%3A03%3A33.796Z" class="cursor-pointer size-[18px] rounded-full select-none ml-auto" draggable="false" alt="">
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
            <nav class="w-full h-12 border-b border-white/5 flex flex-row px-6 items-center">
                <p class="text-xs text-white leading-5">Editing Event</p>
                <button on:click={() => $appState.editingTask = null} class="bg-white/10 hover:bg-white/15 size-5 rounded-md ml-auto flex items-center justify-center text-white">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.5 10.5L5.5 7.5L8.5 4.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>                        
                </button>
            </nav>
            <div class="w-full h-fit flex flex-col gap-2 p-3 border-b border-white/5">
                <SidebarInput title="Title" value="Perform a thorough security audit and vulnerability assessment of the application to identify and address potential security risks, vulnerabilities, and weaknesses." />
                <SidebarInput title="Description" value="" />
            </div>
            <div class="w-full h-fit p-3 flex flex-row gap-1 border-b border-white/5">
                <div class="rounded px-1 w-fit h-fit select-none bg-[#F24822] text-white text-[11px] leading-[19px]">
                    Backend
                </div>
                <div class="size-[19px] flex items-center justify-center bg-white/10 hover:bg-white/15 cursor-pointer rounded">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 7.5H3M7.5 12V3" stroke="white" stroke-opacity="0.75"/>
                    </svg>                        
                </div>
            </div>
        </div>
    </aside>
    
    <div class="size-full flex flex-col gap-4 p-8">
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

        <div class="w-fit flex flex-row gap-4">
            {#if mounted}
                {#each $databaseState.lists as list}
                    <List {list}></List>
                {/each}
            {/if}
        </div>
    </div>
</main>

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
</style>