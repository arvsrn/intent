<script lang="ts">
    import { appState, blurInDownwards, blurInUpwards, clickOutside, colors, colorsNamed, databaseState, sortTasks, syncing } from "$lib";
    import { getTasks } from "$lib/database";
    import type { StateList } from "$lib/schema";
    import { slide } from "svelte/transition";
    import Task from "./Task.svelte";
    import { onMount } from "svelte";
    import { supabase } from "$lib/supabaseClient";
    import { DropdownMenu } from "bits-ui";

    export let list: StateList;
    let addTaskSelected: boolean = false;
    let draggingHere: boolean = false;
    let self: HTMLElement;
    let dropPosition: number = 0;
    let newTaskTitle: string = "";
    let sortedTasks = sortTasks(list.tasks);

    const onMouseMove = (event: MouseEvent) => {
        if (draggingHere && $appState.isDraggingTask) {
            dropPosition = 0;
            
            for (const child of self.querySelectorAll("[data-is-task]:not([data-is-dragging='true'])")) {
                const boundingBox = child.getBoundingClientRect();
                
                if (event.clientY > (boundingBox.bottom - boundingBox.height / 2)) {
                    dropPosition += 1;
                }
            }
        }
    }; 

    const onMouseUp = (event: MouseEvent) => {
        if (Date.now() - $appState.lastMouseDown < 125) {
            $appState.editingTask = $appState.draggingTask;
        } else if ($appState.draggingTask) {
            // updating these updates $databaseState for some reason
            const originList = $databaseState.lists.find(x => x.id === $appState.draggingTask?.list_id)?.tasks;
            const finalList = $databaseState.lists.find(x => x.id === list.id)?.tasks;

            if (originList && finalList) {
                const task = originList.splice(originList.findIndex(x => x.id === $appState.draggingTask?.id), 1)[0];

                /* 
                    if element at dropPosition and dropPosition - 1, index should be average
                    if element at dropPosition but not at dropPosition - 1, index should be dropPosition.index - 64
                    if element at dropPosition - 1 but not at dropPosition, index should be dropPosition - 1.index + 64
                    if neither, index should be 0
                */
                task.index = finalList[dropPosition]?.index !== undefined ? 
                    finalList[dropPosition - 1]?.index !== undefined ? 
                        (finalList[dropPosition - 1].index + finalList[dropPosition].index) / 2
                        : finalList[dropPosition].index - 64
                    : finalList[dropPosition - 1]?.index !== undefined ? 
                        finalList[dropPosition - 1].index + 64
                        : 0;
                
                task.list_id = list.id;

                finalList.push(task);
                $databaseState = $databaseState;

                supabase
                    .from("tasks")
                    .update({
                        list_id: task.list_id,
                        index: task.index,
                    })
                    .eq('id', task.id)
                    .then(x => console.log(x));
            }

            $appState.draggingTask = null;
        }
    };

    const newTaskHandleEnter = async (event: KeyboardEvent) => {
        if (event.key === "Enter") {
            if (newTaskTitle) {
                let idx = sortedTasks.length > 0
                    ? sortedTasks[sortedTasks.length - 1].index + 64 
                    : 0;
                
                list.tasks = [...list.tasks, {
                    index: idx,
                    title: newTaskTitle,
                    description: "",
                    id: '',
                    list_id: list.id,
                    tags: [],
                }];

                const newTaskTitle_ = newTaskTitle;
                newTaskTitle = "";

                $syncing = true;
                
                const { error } = await supabase
                    .from('tasks')
                    .insert({ 
                        index: idx,
                        title: newTaskTitle_,
                        description: "", 
                        list_id: list.id,
                        tags: [],
                    });
                
                // let task = await supabase
                //     .from('tasks')
                //     .select()
                //     .eq('index', idx);
                // 
                // if (task.data) { 
                //     list.tasks[list.tasks.length - 1].id = task.data[0].id;
                //     $databaseState.lists[$databaseState.lists.findIndex(x => x.id === list.id)].tasks = list.tasks;
                // }

                $syncing = false;
            }
        }
    }

    $: list.tasks, sortedTasks = sortTasks(list.tasks);
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<main 
    bind:this={self}
    class="w-80 rounded-xl border border-[#FFFFFF06] h-fit max-h-full overflow-auto bg-[#FFFFFF06] flex flex-none flex-col gap-1.5 p-1.5" 
    
    on:mouseenter={() => draggingHere = true} 
    on:mouseleave={() => draggingHere = false}
    on:mousemove={onMouseMove}
    on:mouseup={onMouseUp}
>
    <div class="w-[306px] sticky h-5 mt-1 px-3 flex flex-row gap-1.5 items-center top-1 z-50 bg-[#252525] info">
        <DropdownMenu.Root>
            <DropdownMenu.Trigger class="size-fit p-1 -mx-1">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="4" cy="4" r="4" fill="{colors[list.color]}"/>
                </svg>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content transition={blurInDownwards} transitionConfig={{ duration: 75 }} sideOffset={4} side="right" align={"start"} alignOffset={-11} class="shadow-[0px_97px_39px_rgba(0,0,0,0.02),0px_54px_33px_rgba(0,0,0,0.08),0px_24px_24px_rgba(0,0,0,0.13),0px_6px_13px_rgba(0,0,0,0.15)] w-[120px] h-fit rounded-md bg-[#313131] border border-[#ffffff06] flex flex-col pb-1"> 
                <div class="w-fill h-fit flex flex-row px-3 pt-2">
                    <p class="text-white/50 text-[11px] leading-5 select-none">Choose a color</p>
                </div>
                <div class="flex flex-col px-1 w-full h-fit">
                    {#each colorsNamed as color, i}
                        <DropdownMenu.Item class="gap-2 outline-none w-full h-8 rounded-md px-2 flex flex-row items-center select-none cursor-pointer text-white text-xs active:bg-white/10 hover:bg-white/10">
                            <div class="size-2 rounded-full" style:background={colors[i]}></div>
                            {color}
                        </DropdownMenu.Item>
                    {/each}
                </div>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
        
        <p class="leading-5 text-[11px] text-white select-none">{list.name}</p>

        <!--
            {#if draggingHere}
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger class="size-5 rounded bg-transparent hover:bg-white/10 flex items-center justify-center ml-auto cursor-pointer">
                        <svg width="15" height="15" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.625 8C3.625 8.62132 3.12132 9.125 2.5 9.125C1.87868 9.125 1.375 8.62132 1.375 8C1.375 7.37868 1.87868 6.875 2.5 6.875C3.12132 6.875 3.625 7.37868 3.625 8Z" fill="#A0A0A0"/>
                            <path d="M8.625 8C8.625 8.62132 8.12132 9.125 7.5 9.125C6.87868 9.125 6.375 8.62132 6.375 8C6.375 7.37868 6.87868 6.875 7.5 6.875C8.12132 6.875 8.625 7.37868 8.625 8Z" fill="#A0A0A0"/>
                            <path d="M13.5 8C13.5 8.62132 12.9963 9.125 12.375 9.125C11.7537 9.125 11.25 8.62132 11.25 8C11.25 7.37868 11.7537 6.875 12.375 6.875C12.9963 6.875 13.5 7.37868 13.5 8Z" fill="#A0A0A0"/>
                        </svg>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end" transition={blurInDownwards} transitionConfig={{ duration: 75 }} sideOffset={0} alignOffset={4} class="z-50 w-36 p-1 h-fit outline outline-1 -outline-offset-1 outline-[#ffffff06] rounded-lg bg-[#404040] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)]">
                        <DropdownMenu.Item class="h-7 text-xs text-[#FF8A7B] px-2 leading-[25px] hover:bg-white/10 active:bg-white/15 outline-none !ring-0 !ring-transparent rounded select-none cursor-pointer flex items-center">Delete list</DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
            {/if} 
        -->
    </div>
    
    {#each sortedTasks as task, i}
        {#if i === dropPosition && !(dropPosition >= list.tasks.length - ($appState.draggingTask?.list_id === list.id ? 1 : 0)) && draggingHere && $appState.isDraggingTask}
            <div id="shadow" style:height="{$appState.draggingTaskHeight}px" class="w-[306px] h-9 border border-white/10 rounded-md bg-[#FFFFFF06] border-dashed flex-none"></div>
        {/if}

        <Task {task} draggable />
    {/each}
    
    {#if dropPosition >= list.tasks.length - ($appState.draggingTask?.list_id === list.id ? 1 : 0) && draggingHere && $appState.isDraggingTask}
        <div id="shadow" style:height="{$appState.draggingTaskHeight}px" class="w-[306px] h-9 border border-white/10 rounded-md bg-[#FFFFFF06] border-dashed flex-none"></div>
    {/if}
    
    <div class="w-[306px] h-fit sticky bottom-0 bg-[#252525] flex flex-col gap-1.5 input">
        <input on:keydown={newTaskHandleEnter} bind:value={newTaskTitle} on:click={() => addTaskSelected = true} use:clickOutside={() => addTaskSelected = false} class="placeholder:select-none flex-none w-full h-9 rounded-md border border-white/10 bg-transparent outline-none px-3 text-xs text-white placeholder:text-white/50" type="text" placeholder="Add task...">

        {#if addTaskSelected}
            <p class="text-[11px] ml-3 -mt-1 text-white/50 select-none flex-none" transition:slide={{ duration: 150 }}>↵ Enter to create</p>
        {/if}
    </div>
</main>

<style>
    main::-webkit-scrollbar {
        display: none;
    }

    main::-webkit-scrollbar-corner {
        background: transparent;
    }

    .input::before, .info::before {
        content: '';
        width: 306px;
        height: 6px;
        background: #252525;
        position: absolute;
        bottom: -6px;
        left: 0px;
    }

    .input::after, .info::after {
        content: '';
        width: 306px;
        height: 6px;
        background: #252525;
        position: absolute;
        top: -6px;
        left: 0px;
    }

    .info::after {
        height: 12px;
        top: -12px;
    }
</style>