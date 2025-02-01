import jwt from 'jsonwebtoken';

export const logout = async (req, res) => {
    try {
        res.clearCookie('token',{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 
            'none' : 'strict',
          });
        
          return res.json({succes:true,
            message:"Logged Out"
          })

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Something went wrong. Please try again later.' });
  
    }

  }