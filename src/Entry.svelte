<style>

    @font-face{
        font-family: aldritch;
        src: url(fonts/Aldrich-Regular.ttf);
    }

    .entry{
        height: 24px;
        display: grid;
        grid-template-columns: 0.5fr 4fr 0.5fr;
        max-height: 24px;
        align-content: flex-start;
        font-family: aldritch;
        margin-bottom: 32px;
        margin-left: 8px;
        margin-right: 64px;
        z-index: 1;
    }

    h1{
        font-size: 24px;
    }

    .entry_pos{
        text-align: center; 
    }

    .entry_name{
        text-align: center;
    }

    .entry_points{
        text-align: center;
    }

    .primary{
        color: white;
    }

    .secondary{
        color: rgb(146, 146, 146);
    }

    .outer{
        position: relative;
    }

    .inner{
        position: absolute;
        top: 10px;
        margin-left: 60px;
        margin-right: auto;
        width: 100%;
    }

    img{
        display: block;
        width: 90%;
    }

</style>

<div class="entry outer">
    {#if entry.color != ""}
        <div >
            <h1 class="entry_pos" style="color: {entry.color};">{entry.pos}</h1>
        </div>

        <div>
            <h1 class="entry_name" style="color: {entry.color}">{entry.name}</h1>
        </div>
        
        <div>
            <h1 class="entry_points" style="color: {entry.color}">{entry.points}</h1>
        </div>

        <div class="inner">
            <img src="build/img/bg_line.png"/>
        </div>
    {:else}
        <div >
            <h1 class="entry_pos { (  entry.style == 0 ? "primary" : "secondary") }">{entry.pos}</h1>
        </div>

        <div>
            <h1 class="entry_name {(  entry.style == 0 ? "primary" : "secondary")}">{entry.name}</h1>
        </div>
        
        <div>
            <h1 class="entry_points {(  entry.style == 0 ? "primary" : "secondary")}">{entry.points}</h1>
        </div>

        <div class="inner">
            <img src="build/img/bg_line.png"/>
        </div>
    {/if}
    
</div>

<script>
    export let entry = {
        "pos" : 0 ,
        "name": "User Name" ,
        "points" : "0000" ,
        "style" : "primary" ,
        "color" : ""
        };
</script>