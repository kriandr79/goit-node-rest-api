import * as path from "node:path";
import multer from "multer";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(process.cwd(), "tmp"));
  },
  filename(req, file, cb) {
    const owner = req.user.id;
    const extname = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extname);
    const newName = `${basename}-${owner}${extname}`;
   

    cb(null, newName);
  },
});

export default multer({ storage });
