import multer from "multer";

const storage = multer.diskStorage({
    destination: './public/upload/',
    filename: (req, file, cb) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    }
  });
  
  const upload = multer({ storage });
  export default upload;
  