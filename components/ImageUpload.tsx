import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ImageIcon } from './icons/ImageIcon';

interface ImageUploadProps {
    imageFile: File | null;
    setImageFile: (file: File | null) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ imageFile, setImageFile }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!imageFile) {
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(imageFile);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

    const handleFileChange = (files: FileList | null) => {
        if (files && files[0]) {
            setImageFile(files[0]);
        }
    };
    
    const onDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    };

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    setImageFile(file);
                    break;
                }
            }
        }
    }, [setImageFile]);

    const handleRemoveImage = () => { setImageFile(null); };

    return (
        <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Upload Image</label>
            {preview ? (
                <div className="relative">
                    <img src={preview} alt="Preview" className="w-full h-auto max-h-64 object-contain rounded-xl bg-gray-100" />
                    <button
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                        aria-label="Remove image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ) : (
                <div
                    onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDragOver={onDragOver} onDrop={onDrop} onPaste={handlePaste} tabIndex={0}
                    className={`flex justify-center items-center w-full px-6 py-10 border-2 border-dashed rounded-xl transition-colors cursor-pointer focus:outline-none cartoon-input ${isDragging ? 'border-blue-500 bg-blue-100' : 'border-gray-800 hover:border-blue-500 bg-amber-100/50'}`}
                >
                    <div className="text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4 flex text-sm text-gray-500">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-100 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none px-1">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e.target.files)} accept="image/*" ref={fileInputRef} />
                            </label>
                            <p className="pl-1">or drag and drop, or paste</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                    </div>
                </div>
            )}
        </div>
    );
};
