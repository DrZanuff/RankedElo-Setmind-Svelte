<style>

    @font-face{
        font-family: aldritch;
        src: url(fonts/Aldrich-Regular.ttf);
    }

    .entry{
        display: grid;
        grid-template-columns: 0.5fr 4fr 0.5fr;
        align-content: flex-start;
        font-family: aldritch;
        margin-left: 42px;
        margin-right: 64px;
        z-index: 1;
    }

    h1{
        font-size: 32px;
    }

    .entry_name{
        text-align: center;
        margin-right: 32px;
    }

    .entry_points{
        text-align: right;
    }

    .primary{
        color: white;
    }

</style>

<div class="entry">
    <h1 class="primary">#</h1>
    <h1 class="primary entry_name">Nome</h1>
    <h1 class="primary entry_points">Pontos</h1>
</div>