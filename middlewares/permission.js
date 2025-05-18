export const superAdmin = (req,res,next) =>
{
    try {
        if(req.userType=="super admin")
        {
            next();
            return;
        }
        res.status(400).json({
            status:false,
            message:"User is not authorized for this request"
        })
    } catch (error) {
        res.status(500).json({
            status:false,
            message:"Internal Server error"
        })
    }
}

export const admin = (req,res,next) =>
{
    try {
        if(req.userType=="super admin" || req.userType=="admin")
        {
            next();
            return;
        }
        res.status(400).json({
            status:false,
            message:"User is not authorized for this request"
        })
    } catch (error) {
        res.status(500).json({
            status:false,
            message:"Internal Server error"
        })
    }
}

export const writer = (req,res,next) =>
{
    try {
        if(req.createdBy == req._id)
        {
            next();
            return;
        }else{
            res.status(400).json({
                status:false,
                message:"User is not authorized for this request"
            })
        }
    } catch (error) {
        res.status(500).json({
            status:false,
            message:"Internal Server error"
        })
    }
}
