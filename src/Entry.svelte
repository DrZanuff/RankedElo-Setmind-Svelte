<style>

    @font-face{
        font-family: aldritch;
        src: url(fonts/Aldrich-Regular.ttf);
    }

    .entry{
        height: 24px;
        display: grid;
        grid-template-columns: 1fr 4fr 1fr;
        max-height: 24px;
        align-content: flex-start;
        font-family: aldritch;
        margin-bottom: 32px;
        margin-left: 64px;
        margin-right: 64px;
        z-index: 1;
        
    }

    h1{
        font-size: 24px;
    }

    .entry_name{
        text-align: center;
    }

    .entry_points{
        text-align: right;
    }

</style>

<div class="entry">
    <h1>{entry.pos}</h1>
    <h1 class="entry_name">{entry.name}</h1>
    <h1 class="entry_points">{entry.points}</h1>
    <img class="bgImgLine" src="img/bg_line.png"/>
</div>

<script>
    export let entry = {"pos" : 0 , "name": "User Name" , "points" : "0000" };
</script>