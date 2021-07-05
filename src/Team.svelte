<script>
    export let teamData = {
        Initials :'777',
        TeamName : 'Setmind',
        logoURL  : 'https://i.postimg.cc/ZRNtP07P/Setmind-Logo-7.png',
        Members  : [],
        Points   : 0,
    }
    
    export let pos = 1;
</script>

<div class="main">
    
    <div class="content">
        {#if pos > 0}
            <p class="pos">{pos}</p>
        {/if}
        <img class="logo" src={teamData.logoURL}>
        <div class="info">
            <p class="team-name">{teamData.TeamName}</p>
            {#if teamData.Points > 0}
                <p class="team-points">{teamData.Points}</p>
            {/if}
        </div>
    </div>

    <img class="bg-line" src="build/img/bg_line.png" alt="">
</div>

<style>
    .main{
        
    }
    .content{
        display: flex;
        flex-direction: row;
        margin-top: 0px;
    }

    .pos{
        font-family: aldritch;
        color: #FFF;
        font-size: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 0px;
        width: 38px;
    }

    .logo{
        height: 76px;
        width: 76px;
        margin-right: 15px;
        margin-left: 10px;
        margin-bottom: 16px;
        object-fit: contain;
    }

    .info{
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .team-name{
        font-family: aldritch;
        color: #FFF;
        font-size: 1.4vw;
    }

    .team-points{
        font-family: aldritch;
        color: #FFF;
        font-size: 1.5vw;
        margin-top: -16px;
    }

    .bg-line{
        width: 100%;
        margin-top: -32px;
        height: 2px;
    }
</style>