<script>

    import{ createEventDispatcher } from 'svelte';
    const signal = createEventDispatcher();

</script>

<div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">

        <div class="mx-auto d-sm-flex d-block flex-sm-nowrap">
            <ul id="bar" class="navbar-nav mr-auto">

            <li class="nav-item">
                <button
                type="button" name="button" class="btn btn-dark"
                on:click={ () => signal("message", { "text":"Wolf" } )  }
                >
                Lobo</button>
            </li>

            <li class="nav-item">
                <button
                type="button" name="button" class="btn btn-dark"
                on:click={ () => signal("message", { "text":"Eagle" } )  }
                >
                Águia</button>
            </li>

            <li class="nav-item">
                <button
                type="button" name="button" class="btn btn-dark"
                on:click={ () => signal("message", { "text":"Bear" } )  }
                >
                Urso</button>
            </li>

            <li class="nav-item">
                <button
                type="button" name="button" class="btn btn-dark"
                on:click={ () => signal("message", { "text":"Lion" } )  }
                >
                Leão</button>

            </li>

            <li class="nav-item">
                <button
                type="button" name="button" class="btn btn-dark"
                on:click={ () => signal("message", { "text":"Dragon" } )  }
                >
                Dragão</button>
            </li>

            </ul>
        </div>

    </nav>
</div>