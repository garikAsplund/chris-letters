// import { getUsers } from '$lib/controller/dbController.js'

export async function load({ route }) {
    // const users = await getUsers.getAll();
    // return {
    //     users
    // }
    console.log(route);
    return {
        route
    }
}