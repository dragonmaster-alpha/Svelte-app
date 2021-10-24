<script>
//Import sub componets.
  import GameItem from "components/Main/GameComponent.svelte";

</script>
<style>
</style>

<div class="main-panel px-8 py-16 bg-gray-custom-3 flex-auto text-white">
    <div class="max-w-screen-md mx-auto">
        <div class="Title mb-8">
            <h1 class="text-3xl font-semibold"> Choose your game </h1>
            <p class="mt-2 text-gray-500"> To continue, pick your game and the coaching service you need. </p>
        </div>

        <div class="gamelist flex flex-col space-y-6">
            <GameItem gametitle="Fighting game" description="Super Smash Bros. Ultimate" price1="80" price2="25" ind="1" />
            <GameItem gametitle="Crossover" description="Super Smash Bros. Brawl" price1="80" price2="30" ind="2" />
            <GameItem gametitle="Fighting game" description="Project M" price1="80" price2="30" ind="3" />
        </div>
    </div>
</div>