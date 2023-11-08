<script>
    import * as ExcelJS from 'exceljs';
    import fs from 'fs';
    import { app } from '$lib/firebase';
    import { getDatabase, ref, get } from 'firebase/database';
    import { adminPlay } from '$lib/stores/AdminStore';

    const database = getDatabase(app);

    let data = {
        blocks: {},
    };

    async function fetchDataFromFirebase() {
        const dataRef = ref(database, 'blocks');
        const dataSnapshot = await get(dataRef);
        
        if (dataSnapshot.exists()) {
            data.blocks = dataSnapshot.val();
            crunchData();
        }
        
        // window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
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
        
        for (const blockKey in data.blocks) {
            const block = data.blocks[blockKey];
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

  function adminPlayClicked() {
    $adminPlay = true;
  }
</script>

<button class=" hover:text-gray-600" on:click={fetchDataFromFirebase}>
    Export data
</button>  
