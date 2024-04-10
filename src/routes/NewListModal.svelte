<script lang="ts">
    import { DropdownMenu } from "bits-ui";
    import SidebarInput from "./SidebarInput.svelte";
    import { blurInDownwards, blurInUpwards, colors, colorsNamed, localState } from "$lib";
    import { supabase } from "$lib/supabaseClient";

    let currentColor: number = 0;
    let listName: string = "";

    export let showingNewListModal: boolean;

    const onClick = async () => {
        const list = await supabase.from('lists').insert({
            name: listName, color: currentColor, project_id: $localState.project.id
        }).select();

        console.log(list);
        showingNewListModal = false;
    }
</script>

<div transition:blurInUpwards={{ duration: 100 }} class="w-[480px] h-fit rounded-xl outline-1 outline -outline-offset-1 outline-[#ffffff06] flex flex-col bg-[#252525] overflow-hidden">
    <div class="w-full h-fit p-6 flex flex-col gap-3">
        <p class="text-sm text-white tracking-wider">Create new list</p>
        
        <div class="flex flex-row gap-3">
            <DropdownMenu.Root>
                <DropdownMenu.Trigger class="size-fit">
                    <div class="size-9 rounded-md flex-none" style:background={colors[currentColor]}></div>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content transition={blurInDownwards} transitionConfig={{ duration: 75 }} sideOffset={4} side="right" align={"start"} alignOffset={-11} class="shadow-[0px_97px_39px_rgba(0,0,0,0.02),0px_54px_33px_rgba(0,0,0,0.08),0px_24px_24px_rgba(0,0,0,0.13),0px_6px_13px_rgba(0,0,0,0.15)] w-[120px] h-fit rounded-md bg-[#313131] border border-[#ffffff06] flex flex-col z-50 pb-1"> 
                    <div class="w-fill h-fit flex flex-row px-3 pt-2">
                        <p class="text-white/50 text-[11px] leading-5 select-none">Choose a color</p>
                    </div>
                    <div class="flex flex-col px-1 w-full h-fit">
                        {#each colorsNamed as color, i}
                            <DropdownMenu.Item on:click={() => currentColor = i} class="gap-2 outline-none w-full h-8 rounded-md px-2 flex flex-row items-center select-none cursor-pointer text-white text-xs active:bg-white/10 hover:bg-white/10">
                                <div class="size-2 rounded-full" style:background={colors[i]}></div>
                                {color}
                            </DropdownMenu.Item>
                        {/each}
                    </div>
                </DropdownMenu.Content>
            </DropdownMenu.Root>

            <input bind:value={listName} type="text" placeholder="Name" class="text-xs text-white leading-5 placeholder:text-white/50 w-full outline-none h-9 flex flex-col bg-[#252525] border border-[rgba(255,255,255,0.03)] rounded-md py-2 px-3 cursor-text">
        </div>
    </div>

    <div class="w-full h-fit p-6 flex flex-row justify-end bg-white/5 border-t border-[#ffffff06]">
        <button on:click={onClick} class="size-fit pl-3 pr-[9px] bg-[#0C8CE9] hover:bg-[#309DEC] py-1.5 rounded-md text-xs text-white flex flex-row gap-2">
            Create list

            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="14" height="14" rx="2" fill="black" fill-opacity="0.2"/>
                <path d="M5.13477 10.0391L2.56445 7.5L5.13477 4.96094V10.0391ZM4.32227 8.07812V6.92187H11.4082V8.07812H4.32227ZM10.2871 8.07812V3H11.4316V8.07812H10.2871Z" fill="white" fill-opacity="0.8"/>
            </svg>                
        </button>
    </div>
</div>