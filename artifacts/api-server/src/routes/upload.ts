import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { uploadsTable } from "@workspace/db";
import { UploadDesignBody } from "@workspace/api-zod";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { randomUUID } from "crypto";

const router: IRouter = Router();

const UPLOADS_DIR = join(process.cwd(), "uploads");

router.post("/upload/design", async (req, res) => {
  try {
    const parsed = UploadDesignBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const { imageData, filename } = parsed.data;

    // Strip data URI prefix and decode base64
    const matches = imageData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches) {
      res.status(400).json({ error: "Invalid image data format" });
      return;
    }

    const buffer = Buffer.from(matches[2], "base64");
    const ext = extname(filename) || ".png";
    const uniqueFilename = `${randomUUID()}${ext}`;

    await mkdir(UPLOADS_DIR, { recursive: true });
    const filePath = join(UPLOADS_DIR, uniqueFilename);
    await writeFile(filePath, buffer);

    const url = `/api/uploads/${uniqueFilename}`;

    await db.insert(uploadsTable).values({ filename: uniqueFilename, url });

    res.json({ url, filename: uniqueFilename });
  } catch (err) {
    req.log.error({ err }, "Failed to upload design");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
