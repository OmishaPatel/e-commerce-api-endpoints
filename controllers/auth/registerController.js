import Joi from 'joi';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import {RefreshToken, User} from '../../models';
import bcrypt from 'bcrypt';
import JwtService from '../../services/JwtService';
import {REFRESH_SECRET} from '../../config';
const registerController = {
    async register(req, res,next){
        // Checklist
        // Validate the request using joi in this project can do manually for smaller projects for bigger projects better to use library
        // Authorize the request
        // Check if user is in database alreaddy
        // prepare model
        // strore in database
        // generate jwt token
        // send response


        // Validation
        const registerSchema = Joi.object({
            name: Joi.string().min(3).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
            repeat_password: Joi.ref('password')
        });
        
        const {error} = registerSchema.validate(req.body); // req.body holds JSON data that is being send to server
        if (error) {
            /* dont use res.json  to send messages when you have multiple endpoints as it would be disorganized make a central file from where errors will be handled. When you use throw error with async function the middleware wont catch it*/
            return next(error);// this way middleware would be able to catch the error
        }
        // check if user in database
        try {
            const exist = await User.exists({
                email: req.body.email
            })
            if (exist) {
                return next(CustomErrorHandler.alreadyExist('Email already exist'));
            }
        } catch(err) {
            return next(err);
        }

        const { name, email, password} = req.body;
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // prepare model
        
        const user = new User({
            name:name,
            email:email,
            password: hashedPassword
        })
        let access_token;
        let refresh_token;
        try {
            const result = await user.save();
            console.log(result)
            // create token
            access_token = JwtService.sign({_id : result._id, role: result.role})// Here is id is object received from result when user is saved to database
            refresh_token = JwtService.sign({_id : result._id, role: result.role}, '1y', REFRESH_SECRET)
            // Database whiitelist
            await RefreshToken.create({token: refresh_token});
        } catch(err){
            return next(err);
        }

        res.json({access_token, refresh_token});
    }
}
export default registerController;