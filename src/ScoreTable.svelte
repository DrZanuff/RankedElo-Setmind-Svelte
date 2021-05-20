<script>
    import Entry from "./Entry.svelte";
    export let rankData = []
</script>

<div class="score_table">

    {#each rankData as entry , i }
        <Entry entry={
            { "pos" : i , "name" : rankData[i][0] , "points" : rankData[i][1] }
        }/>
    {/each}

</div>

<style>
    .score_table{
        width: 100%;
        height: 100%;
    }
</style>