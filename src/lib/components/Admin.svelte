<script>
    import * as ExcelJS from 'exceljs';
    import fs from 'fs';
    import app from '$lib/firebase';
    import { getDatabase, ref, get } from 'firebase/database';
    import { adminPlay } from '$lib/stores/AdminStore';

    // const data = 
    // {
    //     "blocks": {
    //         "b": {
    //         "accuracy": [
    //             1,
    //             1,
    //             1,
    //             1,
    //             1
    //         ],
    //         "guesses": [
    //             "H",
    //             "X",
    //             "W",
    //             "D",
    //             "H"
    //         ],
    //         "reactionTime": [
    //             615,
    //             1621,
    //             1082,
    //             792,
    //             665
    //         ],
    //         "targets": [
    //             "H",
    //             "X",
    //             "W",
    //             "D",
    //             "H"
    //         ],
    //         "trialType": "CC"
    //         },
    //         "n": {
    //         "accuracy": [
    //             1,
    //             0,
    //             1,
    //             1,
    //             1
    //         ],
    //         "guesses": [
    //             "Y",
    //             "W",
    //             "W",
    //             "M",
    //             "F"
    //         ],
    //         "reactionTime": [
    //             800,
    //             778,
    //             663,
    //             661,
    //             762
    //         ],
    //         "targets": [
    //             "Y",
    //             "K",
    //             "W",
    //             "M",
    //             "F"
    //         ],
    //         "trialType": "CC"
    //         },
    //         "test": {
    //         "accuracy": [
    //             1,
    //             1,
    //             1,
    //             1,
    //             0
    //         ],
    //         "guesses": [
    //             "L",
    //             "S",
    //             "D",
    //             "L",
    //             "T"
    //         ],
    //         "reactionTime": [
    //             634,
    //             644,
    //             633,
    //             581,
    //             1328
    //         ],
    //         "targets": [
    //             "L",
    //             "S",
    //             "D",
    //             "L",
    //             "D"
    //         ],
    //         "trialType": "CC"
    //         }
    //     }
    // };

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
    }

    function crunchData() {
        console.log("clicked!!");
        const workbook = new ExcelJS.Workbook();

        // Add headers
        const headers = [
            'Trial ID',
            'Trial Type',
            'Targets',
            'Guesses',
            'Accuracy',
            'Reaction Time',
        ];
        
        // Loop through the 'blocks' data
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
            const excelFilePath = 'blocks_data.xlsx'; // You can adjust the filename
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

<div class="flex flex-col items-center justify-center h-screen space-y-5">
    <h1 class="text-4xl font-bold text-center -translate-y-48 h1">
        🛡️ Admin, nice!!! 🛠
    </h1>
    <button class="px-4 py-2 font-semibold text-gray-600 -translate-y-24 bg-transparent border border-gray-500 rounded hover:bg-gray-500 hover:text-white hover:border-transparent" on:click={fetchDataFromFirebase}>
        Export data
    </button> 
    <button class="px-4 py-2 font-semibold text-gray-600 -translate-y-24 bg-transparent border border-gray-500 rounded hover:bg-gray-500 hover:text-white hover:border-transparent" on:click={adminPlayClicked}>
        Play
    </button> 
</div>