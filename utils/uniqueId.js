export const uniqueId = () => {
    const now = Date.now();
    const random = Math.floor(Math.random()*1000);
    return `${now}${random}`;
}