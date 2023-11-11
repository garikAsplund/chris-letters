<script>
    import * as ExcelJS from 'exceljs';
    import { db as database } from '$lib/firebase';
    import { ref, get } from 'firebase/database';   
    import { page } from '$app/stores'; 

    let excelData = {
        blocks: {},
    };

    async function fetchDataFromFirebase() {
        const dataRef = ref(database, 'blocks');
        const dataSnapshot = await get(dataRef);
        
        if (dataSnapshot.exists()) {
            excelData.blocks = dataSnapshot.val();
            crunchData();
        }    
    }

    function crunchData() {
        console.log("clicked!!");
        const workbook = new ExcelJS.Workbook();

        const headers = [
            'Trial ID',
            'Trial Type',
            'Targets',
            'Guesses',
            'Accuracy',
            'Reaction Time',
        ];
        
        for (const blockKey in excelData.blocks) {
            const block = excelData.blocks[blockKey];
            const worksheet = workbook.addWorksheet(blockKey);
            worksheet.addRow(headers);
            
            const numRows = Math.max(
                block.trialType.length,
                block.targets.length,
                block.guesses.length,
                block.accuracy.length,
                block.reactionTime.length
            );

            for (let i = 0; i < numRows; i++) {
                const newRow = [
                    blockKey,
                    block.trialType,
                    block.targets[i] || '',
                    block.guesses[i] || '',
                    block.accuracy[i] !== undefined ? block.accuracy[i] : '',
                    block.reactionTime[i] || '',
                ];
                worksheet.addRow(newRow);
            }
        }

        workbook.xlsx.writeBuffer().then(buffer => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const excelFilePath = 'blocks_data.xlsx';
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = excelFilePath;
            a.click();
            URL.revokeObjectURL(a.href);
        });
  }
</script>

<button class=" hover:text-gray-400" on:click={fetchDataFromFirebase}>
    Export data
</button> 
{#if $page.data.route.id !== "/admin"}
    <button class=" hover:text-gray-400">
        <a href="/admin">Go to admin panel</a>
    </button>
{:else}
    <button class=" hover:text-gray-400">
        <a href="/">Go to game</a>
    </button>
{/if}