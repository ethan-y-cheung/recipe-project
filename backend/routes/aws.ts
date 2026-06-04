import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import express, { Request, Response} from 'express';
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

interface postRequestBody {
  fileName: string;
  fileType: string;
}
interface viewRequestBody {
  fileKey: string;
}

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || "",
    secretAccessKey: process.env.AWS_SECRET_KEY || "",
  },
  requestChecksumCalculation: "WHEN_REQUIRED" 
} as const);

// get a temp signed url to upload images to aws
router.post("/generate-upload-url", async (req : Request<{}, {}, postRequestBody>, res : Response): Promise<void> => {
  try {
    const {fileName, fileType} = req.body;

    if (!fileName || !fileType) {
      res.status(400).json({error: "Missing either fileName or fileType in request"});
      return;
    }

    const fileKey : string = `recipes/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET || "",
      Key: fileKey,
      ContentType: fileType,
    });

    // generate presigned url to post
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    // send back
    res.json({ uploadUrl, fileKey });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Failed to generate presigned URL in backend:", errorMessage);
    res.status(500).json({ error: "Internal server error in posting photo"} );
  }
});

// get a temp signed url to view images uploaded to aws
router.post("/get-view-url", async (req: Request<{}, {}, viewRequestBody>, res: Response): Promise<void> => {
  const { fileKey } = req.body; // e.g., "profiles/1779395269151-vanGogh.png"
  
  if (!fileKey) {
    res.status(400).json({ error: 'Missing fileKey in request body' });
    return;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: fileKey,
    });

    // Generate a signed URL valid for 1 hour (3600 seconds)
    const viewUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    
    res.json({ viewUrl });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Backend S3 signing crash:', errorMessage);

    res.status(500).json({ error: "Failed to generate view URL" });
  }
});

export default router;