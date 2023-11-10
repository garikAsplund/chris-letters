export const ssr = false;

export async function load({ route }) {
    return {
        route
    }
}