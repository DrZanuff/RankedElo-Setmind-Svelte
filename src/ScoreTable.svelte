<script>
    import Entry from "./Entry.svelte";
    import EntryHeader from "./EntryHeader.svelte";
    export let rankData = [];
    let nameEntry;
    export let teams = [
        { 'Members' : [] }
    ];

    function checkUserTeam(name){
        for (var i=0; i<teams.length; i++){
/*             if ( teams[i].Members === undefined){
                console.log(teams)
                return teams;
            } */
            if ( teams[i].Members.includes(name) ){
                console.log("Found!")
                return teams[i].logoURL;
            }
        }
        return false;
    }
</script>

<div class="score_table">

    <img class="line up" src="build/img/horizontal_line.png" alt="">
    <EntryHeader></EntryHeader>
    <img class="line down" src="build/img/horizontal_line.png" alt="">

    {#each rankData as entry , i }   
        <Entry entry={
            {
                "pos" : i+1 ,
                "name" : rankData[i][0] ,
                "points" : rankData[i][1] ,
                "style" : i % 2 ,
                "badge" : checkUserTeam( rankData[i][0] ) != false ? checkUserTeam( rankData[i][0] ) : false
            }
        }/>
    {/each}

</div>

<style>
    .score_table{
        width: 100%;
        height: 100%;
        overflow: auto;
    }

    .line{
        display: block;
        margin-left: 32px;
        margin-right: 64px;
        width: 90%;
        height: 2px;
        margin-top: 8px;
        margin-bottom: 16px;
    }

    .line.up{
        margin-top: 32px; 
    }
    
    .line.down{
        margin-bottom: 32px;
    }
</style>