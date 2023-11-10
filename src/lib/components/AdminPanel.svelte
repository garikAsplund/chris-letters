<script>
    import { ref, child, get } from "firebase/database";
    import { db } from '$lib/firebase';

    let things = [];
    const dbRef = ref(db);
    get(child(dbRef, 'users')).then((snapshot) => {
    if (snapshot.exists()) {
        console.log(snapshot.val());
        things = snapshot.val();
    } else {
        console.log("No data available");
    }
    }).catch((error) => {
        console.error(error);
    });

    let tableArr = [1, 2, 3, 4, 5, 6, 7, 8, 9]    
</script>

<h1 class="flex justify-center text-4xl font-bold text-center transform translate-y-16">
    Admin panel 🧑‍🔬
</h1>

<div class="flex justify-center translate-y-28">
   <div class="w-2/3 table-container">
        <table class="table table-hover">
            <thead>
                <tr>
                    <th>UserID</th>
                    <th>Name</th>
                    <th>Admin</th>
                </tr>
            </thead>
            <tbody>
                {#each Object.entries(things) as [userId, user]}
                   <tr>
                        <td>{userId}</td>
                        <td>{user.displayName}</td>
                        <td>{user.admin ? 'Yes' : 'No'}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
