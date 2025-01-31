
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../model/userModel';

export const register = asyn (req,res) => {

    const {name,email,password} =req.body;

    if(!name|| !email || !password){
        return res.json({success: false, message : 'MissingDetails'})
    }

    try {

        const existingUser= await userModel.findOne({email})

        if(existingUser){
            return res.json({success: false, message:"User already existis"});

        }
        const hashedPassword = await bcrypt.hash(password,10);
        
        const user = new userModel({name,email,password:hashedPassword});
        await user.save();

        const token = jwt.sing({id: user._id},
             process.env.JWT_SECRET,
            {expiresIn:'7d'});

            res.cookies('token', token, {
                httpOnly:true,
                secure:process.env.NODE_ENV === 'producction',
                sameSite:process.env.NODE_ENV === 'producction'?
                'none':'strict',
                masAge : 7 * 24 * 60 * 1000
            });

            return res.json({succes: true});

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const login = asyn (req,res)=>{
    const{email,password} = req.body;

    if(!email || !password){
        return res.json({
            succes:false, 
            message: 'Email and password are required'})
    }

    try {
        
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({succes:false,
                message:'Invalid email'
            })
        }
        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            res.json({success: false, 
                message: 'InvaliD Password'})
        }

        const token = jwt.sing({id: user._id},
            process.env.JWT_SECRET,
           {expiresIn:'7d'});

           res.cookies('token', token, {
               httpOnly:true,
               secure:process.env.NODE_ENV === 'producction',
               sameSite:process.env.NODE_ENV === 'producction'?
               'none':'strict',
               masAge : 7 * 24 * 60 * 1000
           });

           return res.json({succes: true});



    } catch (error) {
        res.json({success: false, message: error.message})

    }
}

export const logout = async