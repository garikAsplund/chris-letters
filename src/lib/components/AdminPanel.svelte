<script>
    let tableArr = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    export let data;
</script>

<h1 class="flex justify-center text-4xl font-bold text-center transform translate-y-16">
    Admin panel 🧑‍🔬
</h1>

{data}

<div class="flex justify-center translate-y-28">
   <div class="w-2/3 table-container">
        <table class="table table-hover">
            <thead>
                <tr>
                    <th>Position</th>
                    <th>Name</th>
                    <th>Symbol</th>
                    <th>Weight</th>
                </tr>
            </thead>
            <tbody>
                {#each tableArr as row, i}
                    <tr>
                        <td>{row.position}</td>
                        <td>{row.name}</td>
                        <td>{row.symbol}</td>
                        <td>{row.weight}</td>
                    </tr>
                {/each}
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="3">Calculated Total Weight</th>
                    <td>Total Weight</td>
                </tr>
            </tfoot>
        </table>
    </div>
</div>
