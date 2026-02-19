import multer from 'multer';

const storage = multer.diskStorage({
    filename: function(req,file,callback){
        callback(null,file.originalname);
    }
})

// Validation des fichiers
const fileFilter = (req, file, callback) => {
    // Types MIME autorisés
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
        files: 4 // Maximum 4 fichiers
    }
})

export default upload;