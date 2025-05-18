import { Admin } from "../models/Admin.js"
import dotenv from 'dotenv';
dotenv.config();

export const createAdmin = async () =>{
   let admin = await Admin.findOne({userType:"super admin"})
   if(admin) return "Admin already exist!"
   else {
    let email = process.env.ADMIN_EMAIL
    let password = process.env.ADMIN_PASSWORD
    let superAdmin = new Admin({
        email,
        password,
        userType:"super admin"
    })
    await superAdmin.save()
    return "Admin Created"
   }
}