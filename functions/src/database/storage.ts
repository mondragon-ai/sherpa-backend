import * as admin from "firebase-admin";
import * as mime from "mime-types";

export const uploadToGCP = async (
  fileBuffer: Buffer,
  domain: string,
  email = "agent",
  mimeType = "application/octet-stream",
): Promise<{file_url: string; name: string} | null> => {
  if (!fileBuffer) {
    console.error("No buffer provided for upload");
    return null;
  }

  const date = `${Date.now()}`;
  const extension = mime.extension(mimeType) || "";
  const fileUpload = admin
    .storage()
    .bucket("sherpa-dc1fe.appspot.com")
    .file(`${domain}/attachments/${email}/${date}.${extension}`);

  const blobStream = fileUpload.createWriteStream({
    metadata: {
      contentType: mimeType || "image/png",
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on("error", (error: any) => {
      console.error("Error uploading CSV to storage:", error);
      reject(new Error("Reason for rejection"));
    });

    blobStream.on("finish", async () => {
      try {
        await fileUpload.makePublic();
        const file_url = fileUpload.publicUrl();
        resolve({file_url, name: date});
      } catch (error) {
        console.error("Error making file public:", error);
        reject(new Error("Reason for rejection"));
      }
    });

    blobStream.end(fileBuffer);
  });
};
