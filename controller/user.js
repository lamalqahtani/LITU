const mongoose = require('mongoose');
const User = require('../model/users');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

module.exports={
    index: (req,res,next)=>{
        User.find({}).then((users)=>{
            res.locals.users = users;
             next();

        }).catch((error)=>{
            console.log(error);
        })
    },

    indexView:(req,res)=>{
        res.render('users/index');
        //res.send('hi users');
    },

    new: (req,res)=>{
        res.render('users/new');
    },
    
    create:(req,res,next)=>{
        let newUser=new User({
            name:req.body.name,
            DOB:req.body.DOB,
            email:req.body.email,
            gender: req.body.gender,
            department:req.body.department
        })

        User.register(newUser, req.body.password, (error, user) =>{
    
            if(user){
                req.flash('success', 'تم حفظ البيانات بنجاح');
                res.locals.redirect = '/users'; 
            }else{
                console.log(error)
                req.flash('error', `الرجاء التحقق من البيانات`);
                res.locals.redirect = '/users/new';  
            }
            next()
        });  
    },
    login:(req, res, next) =>{
        res.render('users/login');
    },
    authenticate: passport.authenticate('local',{
        failureRedirect: '/users/login',
        failureFlash: 'الرجاء التحقق من بيانات الدخول',
        successRedirect: '/users/show',
        successFlash: 'تم تسجيل الدخول بنجاح'
    }),
    profile:(req,res)=>{
        res.render('users/show');
    },

    edit:(req,res)=>{
        User.findById({_id:req.params.id}).then(user=>{
            res.locals.user = user;
            res.render('users/edit');
        })  
    },

    update:(req,res,next)=>{
        User.updateOne({_id: mongoose.Types.ObjectId(req.params.id)},{
            name: req.body.name,
            email: req.body.email,
            DOB:req.body.DOB,
            gender: req.body.gender,
            department:req.body.department
        }).then(
            ()=>{
              req.flash('success','تم تحديث المعلومات الشخصية ')
              res.locals.redirect = '/users/show';
              next();  
            }
        ).catch(error=>{
            req.flash('error','لم تتم عملية التحديث');
            console.log(`Error Occured ${error}`);
            res.locals.redirect = '/users/show';
              next(); 
        })
    },

    delete: (req,res,next)=>{
        User.deleteOne({_id: req.params.id},function(err){
            if (err){ 
                console.log(err) 
            } 
            else{ 
                console.log("User has been Deleted "); 
                req.flash('error','user has been deleted')
            } 
            res.locals.redirect='/users';
             next();
        });     
    },
    
    logout: (req, res, next) =>{
        req.logout();
        req.flash('success', 'تم تسجيل الخروج بنجاح');
        res.locals.redirect = '/bugs';
        next();
    },
    restrictDev: (req, res, next) =>{
        if (req.isAuthenticated() && req.user.isDev) {
            next();
        }else if (req.isAuthenticated() && !req.user.isDev) {
            res.send('Error: your privilege does not allow you to access this page')/*or page not found*/
        }else{
            req.flash('loginerror', 'عذراً! يجب عليك تسجيل الدخول  ');
            res.render('users/login');
        }
    },
    isAuth:(req,res,next)=>{
        if(req.isAuthenticated()){
            next()
        }else{
            res.render('users/login');
        }
    },
    inputValidation: (req, res, next) =>{

        if(body('name').isLength({min:2,max:25})
        &&body('email').isEmail()
        &&body('password').isLength({min:6})){
            next();
        }else{
            req.flash('error','تحقق من البيانات المدخلة')
            res.send('data invalid');
        }
    },
    validator:(req,res,next)=>{
        
        const error= validationResult(req)
        if(!error.isEmpty()){  
            req.flash('error','الرجاء إدخال بيانات صحيحة')   
             res.redirect('back');      
             res.json({error:error.array()})     
        }else{
            next();
        }
        
    }, 
    redirectView:(req,res,next)=>{
        let redirectPath = res.locals.redirect;
        if(redirectPath){ res.redirect(redirectPath); 
        }else{ next() }
    }
}