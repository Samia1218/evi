export const checkPrice = (visaType,eTOURIST) =>{
    let price = 0
    if(visaType=="eTOURIST VISA") visaType=eTOURIST
    switch(visaType)
    {
        case "eTOURIST VISA (for 30 Days)": price = 80
        break;
        case "eTOURIST VISA (for 1 Year)": price = 99
        break;
        case "eTOURIST VISA (for 5 Years)": price = 180
        break;
        case "eBUSINESS VISA": price = 199
        break;
        case "eMEDICAL VISA": price = 199
        break;
        case "eMEDICAL ATTENDANT VISA": price = 199
        break;
        case "eCONFERENCE VISA": price = 199
        break;
        case "G20 eCONFERENCE VISA": price = 150
        break;
        default:
            price = 100
    }
    return price
}