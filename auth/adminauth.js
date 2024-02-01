const checkAdminAuth=(req,res,next)=>{
    if(req.session.adminAuth){
        next()
    }else{
        res.redirect('/admin/adminlogin')
    }
}
module.exports={checkAdminAuth}