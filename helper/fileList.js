export const checkFile = (visaType) =>{
    let files = []
    switch(visaType)
    {
        case "eTOURIST VISA": files=[{
            name: "Face photo",
            accept: "*"
        },
        {
            name: "Passport",
            accept: "*"
        }
        ]
        break;
        case "eBUSINESS VISA": files=[{
            name: "Face photo",
            accept: "*"
        },
        {
            name: "Passport",
            accept: "*"
        },
        {
            name: "Business Card",
            accept: "*"
        },
        ]
        break;
        case "eMEDICAL ATTENDANT VISA": files=[{
            name: "Face photo",
            accept: "*"
        },
        {
            name: "Passport",
            accept: "*"
        },
        {
            name: "Hospital Letter",
            accept: "*"
        },
        ]
        break;
        case "eMEDICAL VISA": files=[{
            name: "Face photo",
            accept: "*"
        },
        {
            name: "Passport",
            accept: "*"
        },
        {
            name: "Hospital Letter",
            accept: "*"
        },
        ]
        break;
        case "eCONFERENCE VISA": files=[{
            name: "Face photo",
            accept: "*"
        },
        {
            name: "Passport",
            accept: "*"
        },
        {
            name: "Letter of nomination",
            accept: "*"
        },
        {
            name: "Letter of invitation",
            accept: "*"
        }
        ]
        break;
        case "G20 eCONFERENCE VISA": files=[{
            name: "Face photo",
              accept: "*"
        },
        {
            name: "Passport",
              accept: "*"
        },
        {
            name: "Letter of nomination",
            accept: "*"
        },
        {
            name: "Letter of invitation",
            accept: "*"
        }
        ]
        break;
        default:
            files=[]
    }
    return files
}