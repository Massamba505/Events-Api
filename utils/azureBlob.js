// azureBlobService.js
const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');
const fs = require('fs');

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'events'; // Name of your Azure Blob container

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(containerName);

const uploadImage = async (filePath) => {
  const blobName = path.basename(filePath);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const contentType = getContentType(blobName);
  try {
    const uploadBlobResponse = await blockBlobClient.uploadFile(
      filePath, {
      blobHTTPHeaders: { blobContentType: contentType },
      });
    // console.log(`Uploaded block blob ${blobName} successfully`, uploadBlobResponse.requestId);
    return blockBlobClient.url; // Return URL of the uploaded image
  } catch (error) {
    console.error("Error uploading image:", error.message);
    throw error;
  }
};

const getContentType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
      case '.jpg':
      case '.jpeg':
          return 'image/jpeg';
      case '.png':
          return 'image/png';
      case '.gif':
          return 'image/gif';
      case '.bmp':
          return 'image/bmp';
      case '.tiff':
          return 'image/tiff';
      default:
          return 'application/octet-stream'; // Fallback for unknown types
  }
};

module.exports = { uploadImage };
