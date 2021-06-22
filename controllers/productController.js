import {Product} from '../models';
import multer from 'multer';
import path from 'path';
import CustomErrorHandler from '../services/CustomErrorHandler';
import fs from 'fs';
import productSchema from '../validators/productValidator';

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9
        )}${path.extname(file.originalname)}`;
        // 3746674586-836534453.png.originalname will come from client
        cb(null, uniqueName)
    }
});

const handleMultipartData = multer({storage, limits: {fileSize: 1000000 * 5}}).single('image'); // image field comes from client can also upload multiple files 5mb
const productController = {
    async store(req, res, next) {
        // Multipart form data
        handleMultipartData(req, res, async (err) => {
            if(err) {
                return next(CustomErrorHandler.serverError(err.message))
            }
            
            const filePath = req.file.path;//bcoz of multer have access to file that gets uploaded on client
            console.log(filePath)
            // Validation
            
             const {error} = productSchema.validate(req.body);

            if(error) {
                 //delete image when validation failed
                 fs.unlink(`${appRoot}/${filePath}`, (err) => {
                     if(err) {
                        next(CustomErrorHandler.serverError(err.message))
                     }
                      
                 });
                 // joi error for validation
                 return next(error)

             }
             const {name, price} = req.body;
             let document;

             try {
                document = await Product.create({
                    name:name,
                    price:price,
                    image: filePath
                })
             }catch(err){
                return next(err)
             }

             res.status(201).json(document)
        });
    },

        update(req, res, next) {
            handleMultipartData(req, res, async (err) => {
                if(err) {
                    return next(CustomErrorHandler.serverError(err.message))
                }
                let filePath;
                if(req.file) {
                    filePath = req.file.path;
                }
                // Validation
                 const {error} = productSchema.validate(req.body);
    
                if(error) {
                     //delete image when validation failed
                     if(req.file) {
                        fs.unlink(`${appRoot}/${filePath}`, (err) => {
                            if(err) {
                               next(CustomErrorHandler.serverError(err.message))
                            }
                     })
                          
                     };
                     // joi error for validation
                     return next(error)
    
                 }
                 const {name, price} = req.body;
                 let document;
    
                 try {
                    document = await Product.findOneAndUpdate({_id:req.params.id},{
                        name:name,
                        price:price,
                        ...(req.file && {image: filePath}, {new : true})
                    })
                 }catch(err){
                    return next(err)
                 }
    
                 res.status(201).json(document)
            });
        
        },

        async destroy (req, res, next) {
            const document = await Product.findOneAndRemove({_id: req.params.id});

            if(!document) {
                return next(new Error('No document found to delete'))
            }
            // Image delete. Using_doc to get image without getter method
            const imagePath = document._doc.image;
            console.log(imagePath);
            fs.unlink(`${appRoot}/${imagePath}`, (err) => {
                if(err) {
                   return next(CustomErrorHandler.serverError())
                }
            })
            return res.json(document);
        },

        async index(req,res, next) {
            let documents;
            // pagination mongoose-pagination for larger products
            try {
                documents = await Product.find().select('-updatedAt -__v').sort({_id: -1});
            }catch(err) {
                return next(CustomErrorHandler.serverError())
            }
            return res.json(documents);
        },

        async show (req, res, next) {
            let document;
            try {
                document = await Product.findOne({_id :req.params.id}).select('-updatedAt -__v')
            }catch {
                return next(CustomErrorHandler.serverError())
            }
            return res.json(document)
        }
    }


export default productController;