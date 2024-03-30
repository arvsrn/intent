<script lang="ts">
    import { supabase } from "$lib/supabaseClient";
    
    let steps: boolean[] = [true, false];
    let data: string = "";

    let handle: string;
    let displayName: string;
    let input: HTMLInputElement;
    let invalid: boolean = false;

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
            if (!(/[a-z][a-z|0-9|-]{1,}[a-z]/gm.test(data))) {
                console.log(data);
                invalid = true;
                setTimeout(() => invalid = false, 250);
            } else {
                handle = data;
                steps = [true, true];
                data = "";
                setTimeout(() => input.focus(), 10);
            }
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
                    window.location.assign('/');
                });
            });
        }
    }
</script>

<main class="w-screen h-screen bg-gray2 flex flex-col items-center justify-center gap-16">
    {#if steps[1] === false}
        <div class="size-fit flex flex-col gap-2">
            <div class="flex flex-col w-60 h-fit px-3 mb-2">
                <p class="text-xs text-white leading-5">Create an account</p>
                <p class="text-xs text-white/50 leading-5 w-full text-wrap">Handle can contain lowercase letters, digits and hyphens, and can't start/end with a number/hyphen.</p>
            </div>
            <input bind:this={input} on:keydown={onKeyDown} bind:value={data} class:invalid={invalid} type="text" class="w-60 h-8 border border-white/5 rounded-lg text-xs text-white px-3 placeholder:text-white/75 bg-transparent outline-none hover:border-white/10 active:border-white/10" placeholder="Handle">
            <button on:click={onClick} class="w-60 h-8 rounded-lg bg-[#0C8CE9] hover:bg-[#39A1ED] text-xs text-white font-medium">Next</button>
        </div>
    {:else}
        <div class="size-fit flex flex-col gap-2">
            <div class="flex flex-col w-60 h-fit px-3 mb-2">
                <p class="text-xs text-white leading-5">Set a display name</p>
                <p class="text-xs text-white/50 leading-5 w-full text-wrap">This will show up as your username to others.</p>
            </div>
            <input class:invalid={invalid} bind:this={input} on:keydown={onKeyDown} bind:value={data} type="text" class="w-60 h-8 border border-white/5 rounded-lg text-xs text-white px-3 placeholder:text-white/75 bg-transparent outline-none hover:border-white/10 active:border-white/10" placeholder="Display name">
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

    .invalid {
        border: 1px solid #F24822 !important;
        animation: shake 250ms linear;
    }

    @keyframes shake {
        10%, 90% {
            transform: translate3d(-1px, 1px, 0);
        }
        
        20%, 80% {
            transform: translate3d(2px, 0, 0);
        }

        30%, 50%, 70% { 
            transform: translate3d(-3px, -1px, 0);
        }

        40%, 60% {
            transform: translate3d(3px, 2px, 0);
        }
    }
</style>