

//check if demo user
exports.isDemo = async (req, res, next)=> {
    console.log(req.user.email);
    if (req.user.email === "anmolmogalai44@gmail.com" || req.user.email === "Anny@14") {
        return res.status(401).json({
            success: false,
            message: "This is a Demo User",
        });
    }
    next();
}