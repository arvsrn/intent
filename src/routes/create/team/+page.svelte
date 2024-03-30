<script lang="ts">
    import { supabase } from "$lib/supabaseClient";
    import Loader from "../../Loader.svelte";
    
    let steps: boolean[] = [true, false];
    let data: string = "";

    let teamName: string;
    let projectName: string;
    let input: HTMLInputElement;
    let loading: boolean = false;

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter" && data) 
            proceed();            
    };

    const onClick = () => {
        if (data) 
            proceed();
    }

    const proceed = () => {
        if (steps[1] === false) {
            teamName = data;
            steps = [true, true];
            data = "";
            setTimeout(() => input.focus(), 10);
        } else {
            projectName = data;

            supabase.auth.getSession().then(async data => {
                loading = true;

                const userId = data.data.session?.user.id;
                if (!userId) return console.error('womp womp');

                console.log(userId);

                await supabase.from("teams").insert({
                    name: teamName,
                    members: [userId],
                    owner: userId,
                });

                // TODO: this does not ensure unique teams with the same name
                // perhaps make it so that projects in teams must have unique names, must check on client side
                const team = await supabase.from("teams").select().eq('name', teamName);
                
                if (team.data && team.data.length > 0) {
                    await supabase.from("projects").insert({
                        name: projectName,
                        team_id: team.data[0].id,
                    });

                    const project = await supabase.from("projects").select().eq('name', projectName);

                    if (project.data && project.data.length > 0) {
                        const project_id = project.data[0].id;

                        await supabase.from("lists").insert(
                            [
                                {
                                    name: 'Todo',
                                    color: 0,
                                    project_id
                                }, 
                                {
                                    name: 'Complete',
                                    color: 1,
                                    project_id
                                }
                            ]
                        );

                        window.location.assign('/')
                    } else {
                        console.error('project.data is ', project.data);
                    }
                } else {
                    console.error('team.data is ', team.data);
                }
            });
        }
    }
</script>

<main class="w-screen h-screen bg-gray2 flex flex-col items-center justify-center gap-16">
    {#if loading}
        <Loader></Loader>
    {:else}
        {#if steps[1] === false}
            <div class="size-fit flex flex-col gap-2">
                <div class="flex flex-col w-fill h-fit px-3 mb-2">
                    <p class="text-xs text-white leading-5">Create a team</p>
                    <p class="text-xs text-white/50 leading-5">This can be changed later.</p>
                </div>
                <input bind:this={input} on:keydown={onKeyDown} bind:value={data} type="text" class="w-60 h-8 border border-white/5 rounded-lg text-xs text-white px-3 placeholder:text-white/75 bg-transparent outline-none hover:border-white/10 active:border-white/10" placeholder="Team name">
                <button on:click={onClick} class="w-60 h-8 rounded-lg bg-[#0C8CE9] hover:bg-[#39A1ED] text-xs text-white font-medium">Create team</button>
            </div>
        {:else}
            <div class="size-fit flex flex-col gap-2">
                <div class="flex flex-col w-fill h-fit px-3 mb-2">
                    <p class="text-xs text-white leading-5">Create your first project</p>
                    <p class="text-xs text-white/50 leading-5">This can be changed later.</p>
                </div>
                <input bind:this={input} on:keydown={onKeyDown} bind:value={data} type="text" class="w-60 h-8 border border-white/5 rounded-lg text-xs text-white px-3 placeholder:text-white/75 bg-transparent outline-none hover:border-white/10 active:border-white/10" placeholder="Project name">
                <button on:click={onClick} class="w-60 h-8 rounded-lg bg-[#0C8CE9] hover:bg-[#39A1ED] text-xs text-white font-medium">Create your first project</button>
            </div>
        {/if}

        <div class="flex flex-row gap-1 size-fit">
            {#each steps as step}
                <div class="size-1.5 rounded-full bg-white/20" class:complete={step}></div>
            {/each}
        </div>
    {/if}
</main>

<style>
    .complete {
        @apply bg-white/60;
    }
</style>