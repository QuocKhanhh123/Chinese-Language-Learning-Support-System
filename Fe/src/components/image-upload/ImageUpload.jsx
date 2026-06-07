import { Upload } from '@mui/icons-material'
import { useState } from 'react'
import { uploadImage } from '../../utils/firebase/firebaseUtils'

function ImageUpload({ thumb, onImageUpload }) {
    const [image, setImage] = useState(null)
    const [preview, setPreview] = useState(null)
    const [progress, setProgress] = useState(0)
    const [uploading, setUploading] = useState(false)

    const handleImageChange = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        setImage(file)
        setPreview(URL.createObjectURL(file))
        setUploading(true)

        try {
            const uploadedUrl = await uploadImage(file, setProgress)
            setPreview(uploadedUrl)
            onImageUpload(uploadedUrl)
        } catch (error) {
            console.error('Upload failed:', error)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="w-full space-y-3">
            <label className="block text-sm font-medium text-gray-700">
                Ảnh đại diện
            </label>

            <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50">
                {thumb || preview ? (
                    <img
                        src={thumb || preview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border shadow"
                    />
                ) : (
                    <div className="text-gray-400 flex flex-col items-center text-sm">
                        <Upload fontSize="large" />
                        <span>Chưa có ảnh</span>
                    </div>
                )}

                {uploading && (
                    <p className="text-xs text-gray-500 mt-2">
                        Đang tải... {progress}%
                    </p>
                )}

                <input
                    type="file"
                    accept="image/*"
                    id="thumbnail-upload"
                    onChange={handleImageChange}
                    className="hidden"
                />
                <label
                    htmlFor="thumbnail-upload"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 cursor-pointer transition"
                >
                    <Upload fontSize="small" />
                    {image ? 'Chọn ảnh khác' : 'Tải ảnh lên'}
                </label>
            </div>
        </div>
    )
}

export default ImageUpload
