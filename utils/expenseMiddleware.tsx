import multer from "multer";

const storage = multer.diskStorage({
    destination: './public/expense/',
    filename: (req, file, cb) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    }
  });
  
  const expenseUpload = multer({ storage });
  export default expenseUpload;
  