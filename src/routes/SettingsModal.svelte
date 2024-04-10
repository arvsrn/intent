<script lang="ts">
    import { blurInUpwards, databaseState, localState } from "$lib";
    import SidebarInput from "./SidebarInput.svelte";

    let selected: string | null = null;
</script>

<div transition:blurInUpwards={{ duration: 100 }} class="overflow-hidden w-[666px] h-[560px] bg-[#252525] outline outline-1 -outline-offset-1 outline-[#ffffff06] rounded-xl flex flex-row">
    <div class="w-[180px] h-full bg-white/5 border-r border-[#ffffff06] flex flex-col p-2 gap-2 flex-none">
        <p class="text-[11px] leading-5 w-full mx-2 text-white/50 tracking-wider select-none">Teams</p>
        
        <div class="w-full h-fit flex flex-col">
            {#each $databaseState.teams as team}
                <button on:click={() => selected = team.id} class:selected={selected === team.id} class="h-7 w-full px-2 rounded text-xs text-white flex flex-row items-center justify-start hover:bg-white/5 gap-1 select-none">
                    {team.name}                  
                </button>

                {#each team.projects as project}
                    <button on:click={() => selected = project.id} class:selected={selected === project.id} class="h-7 w-full px-2 rounded text-xs text-white flex flex-row items-center justify-start hover:bg-white/5 gap-1 select-none">
                        <svg class="text-white/75" width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 8H12.5M12.5 8L9.5 5M12.5 8L9.5 11" stroke="currentColor" stroke-opacity="0.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        {project.name}
                    </button>
                {/each}
            {/each}
        </div>

        <p class="text-[11px] leading-5 w-full mx-2 text-white/50 tracking-wider select-none">Personal</p>

        <div class="w-full h-fit flex flex-col">
            <button class="h-7 w-full px-2 rounded text-xs text-white flex flex-row items-center justify-start hover:bg-white/5 gap-1 select-none">Profile</button>
            <button class="h-7 w-full px-2 rounded text-xs text-white flex flex-row items-center justify-start hover:bg-white/5 gap-1 select-none">Preferences</button>
            <button class="h-7 w-full px-2 rounded text-xs text-white flex flex-row items-center justify-start hover:bg-white/5 gap-1 select-none">Log out</button>
        </div>
    </div>

    <div class="w-full h-full p-6 gap-4 flex flex-col">
        <div class="w-fit h-fit flex flex-col">
            <p class="text-white/50 tracking-wider leading-6 text-sm font-light">Team Settings</p>
            <p class="text-white tracking-wider leading-6 text-sm">{$localState.team.name}</p>
        </div>

        <div class="w-full h-fit flex flex-row gap-3">
            <div class="aspect-square h-full rounded-md bg-[#4CA8DF]"></div>
            
            <SidebarInput title="Name" value={$localState.team.name}></SidebarInput>
        </div>

        <svg width="438" height="1" viewBox="0 0 438 1" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line y1="0.5" x2="438" y2="0.5" stroke="white" stroke-opacity="0.1" stroke-dasharray="4 4"/>
        </svg>

        <button class="bg-[rgba(242,72,34,0.2)] hover:bg-[rgba(242,72,34,0.3)] text-[#F24822] text-xs font-medium px-3 py-1.5 rounded-md ml-auto w-fit h-fit">Delete Team</button>
    </div>
</div>

<style>
    .selected {
        @apply bg-white/10;
    }
</style>