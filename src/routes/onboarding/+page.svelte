<script lang="ts">
    import { supabase } from "$lib/supabaseClient";
    
    let steps: boolean[] = [true, false];
    let data: string = "";

    let handle: string;
    let displayName: string;
    let input: HTMLInputElement;

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter" && data) {
            if (steps[1] === false) {
                handle = data;
                steps = [true, true];
                data = "";
                setTimeout(() => input.focus(), 10);
            } else {
                displayName = data;

                supabase.auth.getSession().then(data => {
                    const userId = data.data.session?.user.id;
                    if (!userId) 
                        return console.error('userId is ', userId);

                    console.log(userId);
                    
                    supabase.from("users").insert({
                        name: handle,
                        display_name: displayName,
                        id: userId,
                    }).then(data => {
                        window.location.assign('/')
                    });
                });
            }
        }
    };

    const onClick = () => {
        if (data) {
            if (steps[1] === false) {
                handle = data;
                steps = [true, true];
                data = "";
                setTimeout(() => input.focus(), 10);
            } else {
                displayName = data;

                supabase.auth.getSession().then(data => {
                    const userId = data.data.session?.user.id;
                    if (!userId) 
                        return console.error('userId is ', userId);

                    console.log(userId);
                    
                    supabase.from("users").insert({
                        name: handle,
                        display_name: displayName,
                        id: userId,
                    }).then(data => {
                        window.location.assign('/')
                    });
                });
            }
        }
    }
</script>

<main class="w-screen h-screen bg-gray2 flex flex-col items-center justify-center gap-16">
    {#if steps[1] === false}
        <div class="size-fit flex flex-col gap-2">
            <input bind:this={input} on:keydown={onKeyDown} bind:value={data} type="text" class="w-60 h-8 border border-white/5 rounded-lg text-xs text-white px-3 placeholder:text-white/75 bg-transparent outline-none hover:border-white/10 active:border-white/10" placeholder="Handle">
            <button on:click={onClick} class="w-60 h-8 rounded-lg bg-[#0C8CE9] hover:bg-[#39A1ED] text-xs text-white font-medium">Next</button>
        </div>
    {:else}
        <div class="size-fit flex flex-col gap-2">
            <input bind:this={input} on:keydown={onKeyDown} bind:value={data} type="text" class="w-60 h-8 border border-white/5 rounded-lg text-xs text-white px-3 placeholder:text-white/75 bg-transparent outline-none hover:border-white/10 active:border-white/10" placeholder="Display name">
            <button on:click={onClick} class="w-60 h-8 rounded-lg bg-[#0C8CE9] hover:bg-[#39A1ED] text-xs text-white font-medium">Create account</button>
        </div>
    {/if}
    
    <div class="flex flex-row gap-1 size-fit">
        {#each steps as step}
            <div class="size-1.5 rounded-full bg-white/20" class:complete={step}></div>
        {/each}
    </div>
</main>

<style>
    .complete {
        @apply bg-white/60;
    }
</style>