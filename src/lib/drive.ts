import { google } from "googleapis";

// 認証情報のセットアップ
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({ version: "v3", auth });

export interface DriveFolder {
    id: string;
    name: string;
}

export interface DriveFile {
    id: string;
    name: string;
}

export interface DriveCategory {
    folder: DriveFolder;
    images: DriveFile[];
}

/**
 * 指定した親フォルダ内のサブフォルダ一覧を取得する
 */
export async function getSubfolders(parentId: string): Promise<DriveFolder[]> {
    try {
        const response = await drive.files.list({
            q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: "files(id, name)",
            orderBy: "name",
        });
        return (response.data.files as DriveFolder[]) || [];
    } catch (error) {
        console.error("Error fetching subfolders:", error);
        return [];
    }
}

/**
 * 指定したフォルダ内の画像ファイル一覧を取得する
 */
export async function getImagesInFolder(folderId: string): Promise<DriveFile[]> {
    try {
        const response = await drive.files.list({
            q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
            fields: "files(id, name)",
            orderBy: "name",
        });
        return (response.data.files as DriveFile[]) || [];
    } catch (error) {
        console.error(`Error fetching images for folder ${folderId}:`, error);
        return [];
    }
}

/**
 * 親フォルダ内のすべてのサブフォルダとその中の画像を取得する
 */
export async function getDriveGalleryData(parentId: string): Promise<DriveCategory[]> {
    const folders = await getSubfolders(parentId);
    const categories = await Promise.all(
        folders.map(async (folder) => {
            const images = await getImagesInFolder(folder.id);
            return { folder, images };
        })
    );
    return categories;
}

/**
 * 特定フォルダ内の画像をランダムに指定数取得する
 */
export async function getRandomImagesFromFolder(
    folderId: string,
    count: number
): Promise<DriveFile[]> {
    const images = await getImagesInFolder(folderId);
    if (images.length <= count) return images;

    const shuffled = [...images].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

/**
 * 全サブフォルダから画像をまとめてランダムに取得する
 */
export async function getRandomImagesFromAllFolders(
    parentId: string,
    count: number
): Promise<DriveFile[]> {
    const categories = await getDriveGalleryData(parentId);
    const allImages = categories.flatMap((c) => c.images);
    if (allImages.length <= count) return allImages;

    const shuffled = [...allImages].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
